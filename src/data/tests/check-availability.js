/* eslint-env mocha */

import { expect } from 'chai';
import { checkAvailability } from '../check-availability';

describe('integrations: utils', function() {
  describe('check availability', function() {
    it('manual', function() {
      // online
      const integration = {
        availabilityMethod: 'manual',
        isOnline: true,
      };

      expect(checkAvailability(integration)).to.equal(true);

      // offline
      integration.isOnline = false;

      expect(checkAvailability(integration)).to.equal(false);
    });

    it('auto', function() {
      // regular day ================
      // offline: no config found
      const integration = {
        availabilityMethod: 'auto',
        onlineHours: [
          {
            day: 'tuesday',
            from: '09:00 AM',
            to: '05:00 PM',
          },
        ],
      };

      // 2017-05-08, monday
      let date = new Date(Date.parse('2017/05/08 11:10 AM'));

      expect(checkAvailability(integration, date)).to.equal(false);

      // offline: config found but not in range
      // 2017-05-09, tuesday
      date = new Date(Date.parse('2017/05/09 06:10 PM'));

      expect(checkAvailability(integration, date)).to.equal(false);

      // online
      date = new Date(Date.parse('2017/05/09 09:01 AM'));

      expect(checkAvailability(integration, date)).to.equal(true);

      // everyday ===================
      integration.onlineHours = [
        {
          day: 'everyday',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      expect(checkAvailability(integration, date)).to.equal(true);

      // offline
      // tuesday
      date = new Date(Date.parse('2017/05/09 60:10 PM'));
      expect(checkAvailability(integration, date)).to.equal(false);

      // weekdays ===================
      integration.onlineHours = [
        {
          day: 'weekdays',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      expect(checkAvailability(integration, date)).to.equal(true);

      // offline
      // sunday
      date = new Date(Date.parse('2017/05/13 10:10 AM'));
      expect(checkAvailability(integration, date)).to.equal(false);

      // weekends ===================
      integration.onlineHours = [
        {
          day: 'weekends',
          from: '09:00 AM',
          to: '05:00 PM',
        },
      ];

      // online
      // saturday
      date = new Date(Date.parse('2017/05/13 10:10 AM'));
      expect(checkAvailability(integration, date)).to.equal(true);

      // offline
      // tuesday
      date = new Date(Date.parse('2017/05/09 10:10 AM'));
      expect(checkAvailability(integration, date)).to.equal(false);
    });
  });
});
