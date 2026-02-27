import { SPHttpClient } from '@microsoft/sp-http';

export class FolderService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;
  private _libraryName: string = 'JiraDocuments';

  constructor(spHttpClient: SPHttpClient, siteUrl: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl;
  }

  public getFolderServerRelativeUrl(epicId: string): string {
    const siteRelativePath = new URL(this._siteUrl).pathname.replace(/\/$/, '');
    return `${siteRelativePath}/${this._libraryName}/${epicId}`;
  }

  public async ensureFolder(epicId: string): Promise<string> {
    const folderServerRelativeUrl = this.getFolderServerRelativeUrl(epicId);
    const response = await this._spHttpClient.post(
      `${this._siteUrl}/_api/web/folders`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'odata-version': ''
        },
        body: JSON.stringify({ ServerRelativeUrl: folderServerRelativeUrl })
      }
    );

    if (response.status === 409) {
      // Folder already exists
      return folderServerRelativeUrl;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ensure folder (HTTP ${response.status}): ${errorText}`);
    }

    return folderServerRelativeUrl;
  }

  public async folderExists(epicId: string): Promise<boolean> {
    const folderServerRelativeUrl = this.getFolderServerRelativeUrl(epicId);
    const response = await this._spHttpClient.get(
      `${this._siteUrl}/_api/web/GetFolderByServerRelativeUrl('${encodeURIComponent(folderServerRelativeUrl)}')`,
      SPHttpClient.configurations.v1
    );

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check folder existence (HTTP ${response.status}): ${errorText}`);
    }

    return true;
  }
}