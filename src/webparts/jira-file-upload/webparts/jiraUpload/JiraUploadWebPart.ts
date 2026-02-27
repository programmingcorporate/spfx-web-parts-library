import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import UploadForm from './components/UploadForm';
import { QueryParamService } from './services/QueryParamService';
import { MessageBar, MessageBarType, Text } from '@fluentui/react';

export interface IJiraUploadWebPartProps {
  adminGroupName: string;
}

export default class JiraUploadWebPart extends BaseClientSideWebPart<IJiraUploadWebPartProps> {
  public render(): void {
    const epicIdResult = QueryParamService.getEpicId();

    let element: React.ReactElement;

    if (!epicIdResult.valid) {
      element = React.createElement(
        'div',
        { style: { maxWidth: 640, padding: 24 } },
        React.createElement(
          MessageBar,
          { messageBarType: MessageBarType.error },
          epicIdResult.error
        ),
        React.createElement(
          Text,
          { variant: 'small', styles: { root: { color: '#666' } } },
          'Expected URL format: .../SitePages/Upload.aspx?epicId=ABC-123'
        )
      );
    } else {
      element = React.createElement(UploadForm, {
        epicId: epicIdResult.epicId,
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        adminGroupName: this.properties.adminGroupName || 'JiraDocuments Admins'
      });
    }

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Jira Document Upload Settings'
          },
          groups: [
            {
              groupName: 'Permissions',
              groupFields: [
                PropertyPaneTextField('adminGroupName', {
                  label: 'Admin SharePoint Group Name',
                  description: 'Exact name of the SharePoint group that receives admin access to uploaded files. Example: JiraDocuments Admins'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}