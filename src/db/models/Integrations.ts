import { Model, model } from "mongoose";
import Brands from "./Brands";
import {
  IIntegrationDocument,
  IMessengerDataMessagesItem,
  integrationSchema
} from "./definitions/integrations";

interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(
    brandCode: string,
    kind: string,
    brandObject?: boolean
  ): IIntegrationDocument;

  getMessengerMessagesByLanguage(
    integration: IIntegrationDocument
  ): IMessengerDataMessagesItem | null;
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

  /*
  * Get messages config from messengerData by chosen language code in integration
  */
  public static getMessengerMessagesByLanguage(
    integration: IIntegrationDocument
  ): IMessengerDataMessagesItem {
    let messagesByLanguage: IMessengerDataMessagesItem;

    const messengerData = integration.messengerData
      ? integration.messengerData.toJSON()
      : {};
    const languageCode = messengerData.languageCode || "en";

    if (messengerData) {
      const messages = messengerData.messages;

      if (messages) {
        messagesByLanguage = messages[languageCode];
      }
    }

    return messagesByLanguage;
  }
}

integrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  "integrations",
  integrationSchema
);

export default Integrations;
