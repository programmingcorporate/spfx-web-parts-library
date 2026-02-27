// The body shape sent to POST /items on the FormSubmissions list
export interface ISubmissionModel {
  Title: string;             // must be "Submission - {epicId}"
  Field1: string;
  Field2: string;
  Field3: string;
  Field4: string;
  Field5: string;            // ISO date value
  JiraIssueKey: string;      // the epicId value — never accept user input for this
  UploadRequestId: string;   // GUID generated at submission time
}

// The shape returned by the SharePoint REST API after creating the item
export interface ISubmissionListItem {
  Id: number;
  Title: string;
  JiraIssueKey: string;
  UploadRequestId: string;
}