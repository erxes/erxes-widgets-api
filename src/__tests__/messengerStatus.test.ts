import { isOnline, isTimeInBetween } from "../data/resolvers/utils/messenger";

import { connect, disconnect } from "../db/connection";
import { integrationFactory } from "../db/factories";

beforeAll(() => connect());

afterAll(() => disconnect());

describe("Manual mode", () => {
  test("isOnline() must return status as it is", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "manual"
      }
    });

    // online
    integration.messengerData.isOnline = true;
    expect(isOnline(integration)).toBeTruthy();

    // offline
    integration.messengerData.isOnline = false;
    expect(isOnline(integration)).toBeFalsy();
  });
});

describe("Auto mode", () => {
  test("isTimeInBetween()", () => {
    const time1 = "09:00 AM";
    const time2 = "6:00 PM";

    expect(
      isTimeInBetween(new Date("2017/05/08 11:10 AM"), time1, time2)
    ).toBeTruthy();
    expect(
      isTimeInBetween(new Date("2017/05/08 7:00 PM"), time1, time2)
    ).toBeFalsy();
  });

  test("isOnline() must return false if there is no config for current day", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "auto",
        onlineHours: [
          {
            day: "tuesday",
            from: "09:00 AM",
            to: "05:00 PM"
          }
        ]
      }
    });

    // 2017-05-08, monday
    expect(isOnline(integration, new Date("2017/05/08 11:10 AM"))).toBeFalsy();
  });

  test("isOnline() for specific day", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "auto",
        onlineHours: [
          {
            day: "tuesday",
            from: "09:00 AM",
            to: "05:00 PM"
          }
        ]
      }
    });

    // 2017-05-09, tuesday
    expect(isOnline(integration, new Date("2017/05/09 06:10 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/09 09:01 AM"))).toBeTruthy();
  });

  test("isOnline() for everyday", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "auto",
        onlineHours: [
          {
            day: "everyday",
            from: "09:00 AM",
            to: "05:00 PM"
          }
        ]
      }
    });

    // monday -> sunday
    expect(isOnline(integration, new Date("2017/05/08 10:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/09 11:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/10 12:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/11 1:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/12 2:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/13 3:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/14 4:00 PM"))).toBeTruthy();

    // monday -> sunday
    expect(isOnline(integration, new Date("2017/05/08 3:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/09 4:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/10 5:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/11 6:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/12 6:00 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/13 7:00 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/14 8:00 PM"))).toBeFalsy();
  });

  test("isOnline() for weekdays", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "auto",
        onlineHours: [
          {
            day: "weekdays",
            from: "09:00 AM",
            to: "05:00 PM"
          }
        ]
      }
    });

    // weekdays
    expect(isOnline(integration, new Date("2017/05/08 10:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/09 11:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/10 12:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/11 1:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/12 2:00 PM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/11 11:00 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/12 07:00 AM"))).toBeFalsy();

    // weekend
    expect(isOnline(integration, new Date("2017/05/13 10:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/14 11:00 AM"))).toBeFalsy();
  });

  test("isOnline() for weekend", async () => {
    const integration = await integrationFactory({
      messengerData: {
        availabilityMethod: "auto",
        onlineHours: [
          {
            day: "weekends",
            from: "09:00 AM",
            to: "05:00 PM"
          }
        ]
      }
    });

    // weekdays
    expect(isOnline(integration, new Date("2017/05/08 10:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/09 11:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/10 12:00 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/11 1:00 PM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/12 2:00 PM"))).toBeFalsy();

    // weekend
    expect(isOnline(integration, new Date("2017/05/13 10:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/14 11:00 AM"))).toBeTruthy();
    expect(isOnline(integration, new Date("2017/05/13 07:00 AM"))).toBeFalsy();
    expect(isOnline(integration, new Date("2017/05/14 11:00 PM"))).toBeFalsy();
  });
});
