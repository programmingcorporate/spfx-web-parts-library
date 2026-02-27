import { SPHttpClient } from '@microsoft/sp-http';
import { IUploadResultModel } from '../models/UploadResultModel';

export type ProgressCallback = (fileName: string, percent: number) => void;

interface ISharePointFileResponse {
  ServerRelativeUrl: string;
  Name: string;
  UniqueId: string;
}

export class UploadService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;
  private _libraryName: string = 'JiraDocuments';
  private readonly LARGE_FILE_THRESHOLD: number = 10 * 1024 * 1024; // 10MB

  constructor(spHttpClient: SPHttpClient, siteUrl: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl;
  }

  public async uploadFiles(
    files: File[],
    epicId: string,
    uploadRequestId: string,
    listItemId: number,
    onProgress?: ProgressCallback
  ): Promise<IUploadResultModel[]> {
    const results: IUploadResultModel[] = [];

    for (const file of files) {
      if (onProgress) onProgress(file.name, 0);
      const result = await this._uploadSingleFile(file, epicId, uploadRequestId, listItemId, onProgress);
      results.push(result);
    }

    return results;
  }

  private async _uploadSingleFile(
    file: File,
    epicId: string,
    uploadRequestId: string,
    listItemId: number,
    onProgress?: ProgressCallback
  ): Promise<IUploadResultModel> {
    const siteRelativePath = new URL(this._siteUrl).pathname.replace(/\/$/, '');
    const folderServerRelativeUrl = `${siteRelativePath}/${this._libraryName}/${epicId}`;

    if (file.size > this.LARGE_FILE_THRESHOLD) {
      // Handle chunked upload
      const serverRelativeUrl = await this._uploadChunked();
      return this._createUploadResult(file, serverRelativeUrl, epicId, uploadRequestId, listItemId);
    } else {
      // Simple upload
      const arrayBuffer = await file.arrayBuffer();
      if (onProgress) onProgress(file.name, 50);

      const uploadUrl = `${this._siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl}')/Files/Add(url='${file.name}',overwrite=true)`;

      const response = await this._spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/octet-stream',
            'odata-version': ''
          },
          body: arrayBuffer
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload file (HTTP ${response.status}): ${errorText}`);
      }

      const fileResponse: ISharePointFileResponse = await response.json();
      if (onProgress) onProgress(file.name, 75);

      await this._updateFileMetadata(fileResponse.ServerRelativeUrl, epicId, uploadRequestId, listItemId);
      if (onProgress) onProgress(file.name, 100);

      return this._createUploadResult(file, fileResponse.ServerRelativeUrl, epicId, uploadRequestId, listItemId);
    }
  }

  private async _uploadChunked(): Promise<string> {
    // Implementation for chunked upload
    // Placeholder for now
    console.warn('Chunked upload is not implemented yet.');
    return '';
  }

  private async _updateFileMetadata(
    serverRelativeUrl: string,
    epicId: string,
    uploadRequestId: string,
    listItemId: number
  ): Promise<void> {
    try {
      const response = await this._spHttpClient.fetch(
        `${this._siteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')/ListItemAllFields`,
        SPHttpClient.configurations.v1,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
            'X-HTTP-Method': 'MERGE',
            'IF-MATCH': '*',
            'odata-version': ''
          },
          body: JSON.stringify({
            '__metadata': { 'type': 'SP.Data.JiraDocumentsItem' },
            EpicId: epicId,
            UploadRequestId: uploadRequestId,
            LinkedSubmissionId: listItemId.toString()
          })
        }
      );

      if (!response.ok && response.status !== 204) {
        console.warn(`Metadata update skipped (HTTP ${response.status})`);
      }
    } catch (err) {
      console.warn('Metadata update failed — non fatal:', err);
    }
  }

  private _createUploadResult(
    file: File,
    serverRelativeUrl: string,
    epicId: string,
    uploadRequestId: string,
    listItemId: number
  ): IUploadResultModel {
    return {
      fileName: file.name,
      fileUrl: `${this._siteUrl}${serverRelativeUrl}`,
      serverRelativeUrl,
      epicId,
      uploadRequestId,
      linkedSubmissionId: listItemId,
      uploadedAt: new Date().toISOString()
    };
  }
}