import { Document } from 'mongoose';
import { IRule } from './common';

export interface IScheduleDate {
  type?: string;
  month?: string | number;
  day?: string | number;
  time?: string;
}

interface IScheduleDateDocument extends IScheduleDate, Document {}

export interface IEmail {
  attachments?: any;
  subject?: string;
  content?: string;
  templateId?: string;
}

export interface IEmailDocument extends IEmail, Document {}

export interface IMessenger {
  brandId?: string;
  kind?: string;
  sentAs?: string;
  content?: string;
  rules?: IRule[];
}

interface IMessengerDocument extends IMessenger, Document {}

export interface IStats {
  open: number;
  click: number;
  complaint: number;
  delivery: number;
  bounce: number;
  reject: number;
  send: number;
  renderingfailure: number;
}

interface IStatsDocument extends IStats, Document {}

export interface IEngageMessage {
  kind?: string;
  segmentIds?: string[];
  brandIds?: string[];
  tagIds?: string[];
  customerIds?: string[];
  title?: string;
  fromUserId?: string;
  method?: string;
  isDraft?: boolean;
  isLive?: boolean;
  stopDate?: Date;
  messengerReceivedCustomerIds?: string[];
  email?: IEmail;
  scheduleDate?: IScheduleDate;
  messenger?: IMessenger;
  deliveryReports?: any;
  stats?: IStats;
}

export interface IEngageMessageDocument extends IEngageMessage, Document {
  scheduleDate?: IScheduleDateDocument;

  email?: IEmailDocument;
  messenger?: IMessengerDocument;
  stats?: IStatsDocument;

  _id: string;
}
