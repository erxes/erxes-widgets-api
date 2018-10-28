import { Model, model } from "mongoose";
import { MessengerApps } from ".";
import Brands from "./Brands";
import {
  IIntegrationDocument,
  IMessengerDataMessagesItem,
  integrationSchema
} from "./definitions/integrations";
import {
  IKnowledgebaseCredentials,
  ILeadCredentials
} from "./definitions/messengerApps";

interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean
  ): IIntegrationDocument;

  getMessengerData(integration: IIntegrationDocument);
}

class Integration {
  /*
   * Get integration
   */
  public static async getIntegration(
    brandCode: string,
    kind: string,
    brandObject = false
  ) {
    const brand = await Brands.findOne({ code: brandCode });

    if (!brand) {
      throw new Error("Brand not found");
    }

    const integration = await Integrations.findOne({
      brandId: brand._id,
      kind
    });

    if (brandObject) {
      return {
        integration,
        brand
      };
    }

    return integration;
  }

  public static async getMessengerData(integration: IIntegrationDocument) {
    let messagesByLanguage: IMessengerDataMessagesItem;
    let messengerData = integration.messengerData;

    if (messengerData) {
      messengerData = messengerData.toJSON();

      const languageCode = integration.languageCode || "en";
      const messages = messengerData.messages;

      if (messages) {
        messagesByLanguage = messages[languageCode];
      }
    }

    // knowledgebase app =======
    const kbApp = await MessengerApps.findOne({
      kind: "knowledgebase",
      "credentials.integrationId": integration._id
    });

    const kbCredentials = kbApp && kbApp.credentials ? kbApp.credentials : {};

    // lead app ==========
    const leadApp = await MessengerApps.findOne({
      kind: "lead",
      "credentials.integrationId": integration._id
    });

    const leadCredentials =
      leadApp && leadApp.credentials ? leadApp.credentials : {};

    return {
      ...(messengerData || {}),
      messages: messagesByLanguage,
      knowledgebaseTopicId: kbCredentials
        ? (kbCredentials as IKnowledgebaseCredentials).topicId
        : null,
      formId: leadCredentials
        ? (leadCredentials as ILeadCredentials).formId
        : null
    };
  }
}

integrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  "integrations",
  integrationSchema
);

export default Integrations;
