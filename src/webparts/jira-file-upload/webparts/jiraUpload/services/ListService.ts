import { SPHttpClient } from '@microsoft/sp-http';
import { ISubmissionModel, ISubmissionListItem } from '../models/SubmissionModel';

export class ListService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;
  private _listName: string = 'FormSubmissions';

  constructor(spHttpClient: SPHttpClient, siteUrl: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl;
  }

  private _getHeaders(): Record<string, string> {
    return {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'odata-version': ''
    };
  }

  public async createSubmission(model: ISubmissionModel): Promise<number> {
    const response = await this._spHttpClient.post(
      `${this._siteUrl}/_api/web/lists/GetByTitle('${this._listName}')/items`,
      SPHttpClient.configurations.v1,
      {
        headers: this._getHeaders(),
        body: JSON.stringify(model)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create list item (HTTP ${response.status}): ${errorText}`);
    }

    const item: ISubmissionListItem = await response.json();
    return item.Id;
  }
}