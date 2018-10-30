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

    const topicId =
      kbApp && kbApp.credentials
        ? (kbApp.credentials as IKnowledgebaseCredentials).topicId
        : null;

    // lead app ==========
    const leadApp = await MessengerApps.findOne({
      kind: "lead",
      "credentials.integrationId": integration._id
    });

    const formCode =
      leadApp && leadApp.credentials
        ? (leadApp.credentials as ILeadCredentials).formCode
        : null;

    return {
      ...(messengerData || {}),
      messages: messagesByLanguage,
      knowledgeBaseTopicId: topicId,
      formCode
    };
  }
}

integrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  "integrations",
  integrationSchema
);

export default Integrations;
