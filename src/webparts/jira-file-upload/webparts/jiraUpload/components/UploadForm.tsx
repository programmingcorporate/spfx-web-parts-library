import * as React from 'react';
import { IFormModel, EMPTY_FORM, FIELD3_OPTIONS, IFormValidationErrors } from '../models/FormModel';
import { ISubmissionResult } from '../models/UploadResultModel';
import { ListService } from '../services/ListService';
import { FolderService } from '../services/FolderService';
import { UploadService } from '../services/UploadService';
import { PermissionService } from '../services/PermissionService';
import { GuidService } from '../services/GuidService';
import { Stack, Text, TextField, Dropdown, DatePicker, DefaultButton, PrimaryButton, Spinner, MessageBar, MessageBarType, Label, IconButton, IDropdownOption } from '@fluentui/react';
import { Field3Choice } from '../models/FormModel';
import { SPHttpClient } from '@microsoft/sp-http';

export interface IUploadFormProps {
  epicId: string;
  siteUrl: string;
  spHttpClient: SPHttpClient;
  adminGroupName: string;
}

const UploadForm: React.FC<IUploadFormProps> = ({ epicId, siteUrl, spHttpClient, adminGroupName }) => {
  const [form, setForm] = React.useState<IFormModel>({ ...EMPTY_FORM });
  const [files, setFiles] = React.useState<File[]>([]);
  const [errors, setErrors] = React.useState<IFormValidationErrors>({});
  const [submitState, setSubmitState] = React.useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [progressMessage, setProgressMessage] = React.useState<string>('');
  const [result, setResult] = React.useState<ISubmissionResult | null>(null);
  const [submitError, setSubmitError] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const listService = React.useMemo(() => new ListService(spHttpClient, siteUrl), [spHttpClient, siteUrl]);
  const folderService = React.useMemo(() => new FolderService(spHttpClient, siteUrl), [spHttpClient, siteUrl]);
  const uploadService = React.useMemo(() => new UploadService(spHttpClient, siteUrl), [spHttpClient, siteUrl]);
  const permissionService = React.useMemo(
    () => new PermissionService(spHttpClient, siteUrl, adminGroupName),
    [spHttpClient, siteUrl, adminGroupName]
  );

  const validateForm = React.useCallback((): boolean => {
    const newErrors: IFormValidationErrors = {};
    if (!form.field1.trim()) newErrors.field1 = 'Field 1 is required.';
    if (!form.field2.trim()) newErrors.field2 = 'Field 2 is required.';
    if (!form.field3) newErrors.field3 = 'Please select a value for Field 3.';
    if (!form.field5.trim()) newErrors.field5 = 'Date is required.';
    if (files.length === 0) newErrors.files = 'At least one file must be attached.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newFiles = Array.from(e.target.files ?? []);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number): void => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = React.useCallback(async () => {
    if (!validateForm()) return;

    setSubmitState('submitting');
    setProgressMessage('Creating submission record...');

    try {
      const uploadRequestId = GuidService.newGuid();
      const listItemId = await listService.createSubmission({
        Title: `Submission - ${epicId}`,
        Field1: form.field1.trim(),
        Field2: form.field2.trim(),
        Field3: form.field3,
        Field4: form.field4.trim(),
        Field5: form.field5,
        JiraIssueKey: epicId,
        UploadRequestId: uploadRequestId,
      });

      setProgressMessage(`Preparing folder for ${epicId}...`);
      await folderService.ensureFolder(epicId);

      setProgressMessage('Uploading files...');
      const uploadedFiles = await uploadService.uploadFiles(
        files,
        epicId,
        uploadRequestId,
        listItemId,
        (fileName, pct) => setProgressMessage(`Uploading "${fileName}"... ${pct}%`)
      );

      setProgressMessage('Applying security permissions...');
      const permErrors: string[] = [];
      for (const file of uploadedFiles) {
        try {
          await permissionService.secureFile(file.serverRelativeUrl, 'Contribute');
        } catch (err) {
          permErrors.push(`Failed to secure file ${file.fileName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      setResult({
        listItemId,
        uploadRequestId,
        epicId,
        uploadedFiles,
        status: permErrors.length === 0 ? 'success' : 'partial',
        errors: permErrors
      });
      setSubmitState('done');
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  }, [validateForm, form, files, epicId, listService, folderService, uploadService, permissionService]);

  const handleReset = React.useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setFiles([]);
    setErrors({});
    setSubmitState('idle');
    setProgressMessage('');
    setResult(null);
    setSubmitError('');
  }, []);

  if (submitState === 'done' && result) {
    return (
      <div>
        {/* Render UploadResult component here */}
      </div>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 16 }} styles={{ root: { maxWidth: 640, padding: 24 } }}>
      <Text variant="xLargePlus">Document Submission</Text>
      <Text variant="medium">Epic: <strong>{epicId}</strong></Text>
      {submitState === 'error' && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setSubmitError('')}>
          {submitError}
        </MessageBar>
      )}
      <TextField
        label="Field 1"
        required
        value={form.field1}
        onChange={(_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
          setForm(prev => ({ ...prev, field1: newVal ?? '' }));
          setErrors(prev => ({ ...prev, field1: undefined }));
        }}
      />
      <TextField
        label="Field 2"
        required
        value={form.field2}
        onChange={(_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
          setForm(prev => ({ ...prev, field2: newVal ?? '' }));
          setErrors(prev => ({ ...prev, field2: undefined }));
        }}
      />
      <Dropdown
        label="Field 3"
        required
        options={FIELD3_OPTIONS.map((opt) => ({ key: opt, text: opt }))}
        selectedKey={form.field3}
        onChange={(_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
          setForm(prev => ({ ...prev, field3: (option?.key as Field3Choice | '') ?? '' }));
          setErrors(prev => ({ ...prev, field3: undefined }));
        }}
      />
      <TextField
        label="Field 4"
        multiline
        rows={4}
        value={form.field4}
        onChange={(_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newVal?: string) => {
          setForm(prev => ({ ...prev, field4: newVal ?? '' }));
          setErrors(prev => ({ ...prev, field4: undefined }));
        }}
      />
      <DatePicker
        label="Field 5"
        value={form.field5 ? new Date(form.field5 + 'T00:00:00') : undefined}
        onSelectDate={(date: Date | null | undefined): void => {
          if (date) {
            setForm(prev => ({ ...prev, field5: date.toISOString().split('T')[0] }));
            setErrors(prev => ({ ...prev, field5: undefined }));
          } else {
            setForm(prev => ({ ...prev, field5: '' }));
          }
        }}
      />
      <Label>Attachments</Label>
      <DefaultButton
        text="Attach Files"
        iconProps={{ iconName: 'Attach' }}
        onClick={() => fileInputRef.current?.click()}
      />
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {errors.files && <Text variant="small" styles={{ root: { color: 'red' } }}>{errors.files}</Text>}
      {files.map((file, idx) => (
        <Stack horizontal tokens={{ childrenGap: 8 }} key={idx} styles={{ root: { background: '#f3f2f1', padding: 8 } }}>
          <Text>{file.name}</Text>
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => removeFile(idx)} />
        </Stack>
      ))}
      {submitState === 'submitting' && (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <Spinner />
          <Text>{progressMessage}</Text>
        </Stack>
      )}
      <Stack horizontal tokens={{ childrenGap: 16 }}>
        <PrimaryButton
          text={submitState === 'submitting' ? 'Submitting...' : 'Submit'}
          disabled={submitState === 'submitting'}
          onClick={handleSubmit}
        />
        <DefaultButton
          text="Clear"
          disabled={submitState === 'submitting'}
          onClick={handleReset}
        />
      </Stack>
    </Stack>
  );
};

export default UploadForm;