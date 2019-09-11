import { Model, model } from 'mongoose';
import { MessengerApps } from '.';
import Brands from './Brands';
import { IIntegrationDocument, IMessengerDataMessagesItem, integrationSchema } from './definitions/integrations';
import { IKnowledgebaseCredentials, ILeadCredentials } from './definitions/messengerApps';

interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(brandCode: string, kind: string, brandObject?: boolean): IIntegrationDocument;

  getMessengerData(integration: IIntegrationDocument);

  increaseViewCount(formId: string): Promise<IIntegrationDocument>;
  increaseContactsGathered(formId: string): Promise<IIntegrationDocument>;
}

export const loadClass = () => {
  class Integration {
    /*
     * Get integration
     */
    public static async getIntegration(brandCode: string, kind: string, brandObject = false) {
      const brand = await Brands.findOne({ code: brandCode });

      if (!brand) {
        throw new Error('Brand not found');
      }

      const integration = await Integrations.findOne({
        brandId: brand._id,
        kind,
      });

      if (brandObject) {
        return {
          integration,
          brand,
        };
      }

      return integration;
    }

    public static async getMessengerData(integration: IIntegrationDocument) {
      let messagesByLanguage: IMessengerDataMessagesItem;
      let messengerData = integration.messengerData;
      if (messengerData) {
        messengerData = messengerData.toJSON();

        const languageCode = integration.languageCode || 'en';
        const messages = messengerData.messages;

        if (messages) {
          messagesByLanguage = messages[languageCode];
        }
      }

      // knowledgebase app =======
      const kbApp = await MessengerApps.findOne({
        kind: 'knowledgebase',
        'credentials.integrationId': integration._id,
      });

      const topicId = kbApp && kbApp.credentials ? (kbApp.credentials as IKnowledgebaseCredentials).topicId : null;

      // lead app ==========
      const leadApp = await MessengerApps.findOne({
        kind: 'lead',
        'credentials.integrationId': integration._id,
      });

      const formCode = leadApp && leadApp.credentials ? (leadApp.credentials as ILeadCredentials).formCode : null;

      return {
        ...(messengerData || {}),
        messages: messagesByLanguage,
        knowledgeBaseTopicId: topicId,
        formCode,
      };
    }

    public static async increaseViewCount(formId: string) {
      const integration = await Integrations.findOne({ _id: formId });

      if (!integration) {
        throw new Error('Integration not found');
      }

      const leadData = integration.leadData;

      let viewCount = 0;

      if (leadData && leadData.viewCount) {
        viewCount = leadData.viewCount;
      }

      viewCount++;

      leadData.viewCount = viewCount;

      await Integrations.updateOne({ formId }, { leadData });

      return Integrations.findOne({ formId });
    }

    /*
     * Increase form submitted count
     */
    public static async increaseContactsGathered(formId: string) {
      const integration = await Integrations.findOne({ _id: formId });

      if (!integration) {
        throw new Error('Integration not found');
      }

      const leadData = integration.leadData;

      let contactsGathered = 0;

      if (leadData && leadData.contactsGathered) {
        contactsGathered = leadData.contactsGathered;
      }

      contactsGathered++;

      leadData.contactsGathered = contactsGathered;

      await Integrations.updateOne({ formId }, { leadData });

      return Integrations.findOne({ formId });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>('integrations', integrationSchema);

export default Integrations;
