import { Model, model } from "mongoose";
import { configSchema, IConfig } from "./definitions/configs";

interface IConfigModel extends Model<IConfig> {}

const Configs = model<IConfig, IConfigModel>("configs", configSchema);

export default Configs;
