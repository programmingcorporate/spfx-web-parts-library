import { SPHttpClient } from '@microsoft/sp-http';

export type AdminPermissionLevel = 'Contribute' | 'Read';

export class PermissionService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;
  private _adminGroupName: string;

  private readonly ROLE_DEF_CONTRIBUTE = 1073741827;
  private readonly ROLE_DEF_READ = 1073741826;

  constructor(spHttpClient: SPHttpClient, siteUrl: string, adminGroupName: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl;
    this._adminGroupName = adminGroupName;
  }

  public async secureFile(
    serverRelativeUrl: string,
    adminPermission: AdminPermissionLevel
  ): Promise<void> {
    const listItemBase = `${this._siteUrl}/_api/web/GetFileByServerRelativeUrl('${encodeURIComponent(serverRelativeUrl)}')/ListItemAllFields`;

    await this._breakRoleInheritance(listItemBase);

    const currentUserId = await this._getCurrentUserId();
    await this._addRoleAssignment(listItemBase, currentUserId, this.ROLE_DEF_CONTRIBUTE);

    const adminGroupId = await this._getGroupId(this._adminGroupName);
    const roleDefId = adminPermission === 'Contribute' ? this.ROLE_DEF_CONTRIBUTE : this.ROLE_DEF_READ;
    await this._addRoleAssignment(listItemBase, adminGroupId, roleDefId);
  }

  private async _breakRoleInheritance(listItemBase: string): Promise<void> {
    const response = await this._spHttpClient.post(
      `${listItemBase}/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: ''
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to break role inheritance (HTTP ${response.status}): ${errorText}`);
    }
  }

  private async _addRoleAssignment(
    listItemBase: string,
    principalId: number,
    roleDefId: number
  ): Promise<void> {
    const response = await this._spHttpClient.post(
      `${listItemBase}/roleassignments/addroleassignment(principalid=${principalId},roledefid=${roleDefId})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: ''
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add role assignment (HTTP ${response.status}): ${errorText}`);
    }
  }

  private async _getCurrentUserId(): Promise<number> {
    const response = await this._spHttpClient.get(
      `${this._siteUrl}/_api/web/currentuser?$select=Id`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get current user ID (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.Id;
  }

  private async _getGroupId(groupName: string): Promise<number> {
    const response = await this._spHttpClient.get(
      `${this._siteUrl}/_api/web/sitegroups/getbyname('${encodeURIComponent(groupName)}')?$select=Id`,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Admin group "${groupName}" not found. Verify the group name in the web part property pane. (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.Id;
  }
}