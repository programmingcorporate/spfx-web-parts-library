export type EpicIdResult =
  | { valid: true; epicId: string }
  | { valid: false; error: string };

export class QueryParamService {
  public static getEpicId(): EpicIdResult {
    const params = new URLSearchParams(window.location.search);
    const epicId = params.get('epicId');

    if (!epicId || epicId.trim() === '') {
      return { valid: false, error: 'No Jira Epic ID found in the URL. Please access this page from a valid Jira Epic link.' };
    }

    const trimmedValue = epicId.trim();
    const regex = /^[A-Z]+-\d+$/;

    if (!regex.test(trimmedValue)) {
      return { valid: false, error: `Invalid Epic ID format: "${trimmedValue}". Expected format: ABC-123` };
    }

    return { valid: true, epicId: trimmedValue };
  }
}