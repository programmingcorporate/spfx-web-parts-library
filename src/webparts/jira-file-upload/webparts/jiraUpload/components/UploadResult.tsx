import * as React from 'react';
import {
  Stack,
  Text,
  MessageBar,
  MessageBarType,
  Link,
  PrimaryButton,
  Separator,
} from '@fluentui/react';
import { ISubmissionResult, IUploadResultModel } from '../models/UploadResultModel';

export interface IUploadResultProps {
  result: ISubmissionResult;
  onSubmitAnother: () => void;
}

const UploadResult: React.FC<IUploadResultProps> = ({ result, onSubmitAnother }) => {
  return (
    <Stack tokens={{ childrenGap: 16 }} styles={{ root: { maxWidth: 640, padding: 24 } }}>
      <MessageBar
        messageBarType={result.status === 'success' ? MessageBarType.success : MessageBarType.warning}
      >
        {result.status === 'success'
          ? 'Submission complete. Your documents have been uploaded and secured.'
          : 'Submission completed with warnings. Documents uploaded but some permission assignments may need review.'}
      </MessageBar>

      <Text variant="large">Submission Details</Text>
      <Text variant="small">Epic ID: {result.epicId}</Text>
      <Text variant="small">List Item ID: {result.listItemId}</Text>
      <Text variant="small">Upload Request ID: {result.uploadRequestId}</Text>

      <Separator />

      <Text variant="large">Uploaded Documents ({result.uploadedFiles.length})</Text>
      {result.uploadedFiles.map((file: IUploadResultModel, idx: number) => (
        <Stack
          key={idx}
          tokens={{ childrenGap: 8 }}
          styles={{ root: { background: '#f3f2f1', padding: '10px 12px', borderRadius: 2, borderLeft: '3px solid #0078d4' } }}
        >
          <Text><strong>{file.fileName}</strong></Text>
          <Link href={file.fileUrl} target="_blank">{file.fileUrl}</Link>
          <Text variant="tiny">Uploaded at: {new Date(file.uploadedAt).toLocaleString()}</Text>
        </Stack>
      ))}

      {result.errors.map((error: string, idx: number) => (
        <MessageBar key={idx} messageBarType={MessageBarType.warning}>{error}</MessageBar>
      ))}

      <Separator />

      <Stack horizontal tokens={{ childrenGap: 16 }}>
        <PrimaryButton text="Submit Another Document" onClick={onSubmitAnother} />
      </Stack>

      <Text variant="tiny">
        Copy the document URLs above into your Jira Epic. Access is restricted to you and the designated admin group.
      </Text>
    </Stack>
  );
};

export default UploadResult;