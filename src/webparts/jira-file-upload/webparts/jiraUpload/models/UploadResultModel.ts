// Result for one successfully uploaded file
export interface IUploadResultModel {
  fileName: string;
  fileUrl: string;            // absolute URL: siteUrl + serverRelativeUrl
  serverRelativeUrl: string;  // e.g. /sites/dev/JiraDocuments/PROJ-123/file.pdf
  epicId: string;
  uploadRequestId: string;
  linkedSubmissionId: number; // list item Id from FormSubmissions
  uploadedAt: string;         // new Date().toISOString()
}

// The final result object passed to the UploadResult component
export interface ISubmissionResult {
  listItemId: number;
  uploadRequestId: string;
  epicId: string;
  uploadedFiles: IUploadResultModel[];
  status: 'success' | 'partial' | 'failed';
  errors: string[];           // non-fatal warnings (e.g. permission failures)
}