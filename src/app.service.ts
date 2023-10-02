import { Injectable } from '@nestjs/common';
import { Engine } from 'json-rules-engine';

@Injectable()
export class AppService {
  //simulate a group of rules
  //we are going to filter by groupName gotten in the route
  rules = [
    {
      groupName: 'BUROCRA-PART',
      conditions: {
        all: [
          {
            fact: 'OdometerDiff',
            operator: 'lessThanInclusive',
            value: 500,
          },
          {
            fact: 'PartCode',
            operator: 'equal',
            value: 1,
          },
        ],
      },
      event: {
        type: 'validationRequiredPartCode-1',
        params: {
          message: 'Necessário Validação',
          groupsApprove: [1, 2, 3],
        },
      },
    },
    {
      groupName: 'BUROCRA-PART',
      conditions: {
        any: [
          {
            all: [
              {
                fact: 'OdometerDiff',
                operator: 'lessThanInclusive',
                value: 1500,
              },
              {
                fact: 'PartCode',
                operator: 'equal',
                value: 2,
              },
            ],
          },
        ],
      },
      event: {
        type: 'validationRequiredPartCode-2',
        params: {
          message: 'Necessário Validação',
          groupsApprove: [1, 2, 3],
        },
      },
    },
    {
      groupName: 'BUROCRA-PART',
      conditions: {
        any: [
          {
            all: [
              {
                fact: 'OdometerDiff',
                operator: 'lessThanInclusive',
                value: 1500,
              },
              {
                fact: 'PartCode',
                operator: 'equal',
                value: 2,
              },
              {
                fact: 'BranchId',
                operator: 'equal',
                value: 1,
              },
            ],
          },
        ],
      },
      event: {
        type: 'validationRequiredPartCode-2-BranchId-1',
        params: {
          message: 'Necessário Validação',
          groupsApprove: [5, 8],
        },
      },
    },
  ];

  //simulating a payload
  facts = [
    {
      PartCode: 1,
      LastChange: '2023-09-20 10:32:11',
      LastChangeOdometer: 8000,
      CountDown: 8500,
      OdometerDiff: 300,
      BranchId: 1,
      UserRequester: 157927,
    },
    {
      PartCode: 2,
      LastChange: '2023-09-20 10:32:11',
      LastChangeOdometer: 8000,
      CountDown: 9000,
      OdometerDiff: 1000,
      BranchId: 1,
    },
  ];

  async getHello(): Promise<any> {
    try {
      let engine = new Engine();
      this.rules.forEach((rule) => engine.addRule(rule));

      // Evaluate facts against rules concurrently using Promise.all()
      const results = await Promise.all(
        this.facts.map(async (fact) => {
          try {
            // Execute engine with the current fact
            let rsl = await engine.run(fact);
            // If the engine does not throw an error, the fact satisfies the rules
            return {
              fact,
              passed: rsl.events?.length ? true : false,
              events: rsl.events,
            };
          } catch (error) {
            // If an error is thrown, the fact does not satisfy the rules
            return { fact, passed: false, error: error.message };
          }
        }),
      );
      return results;
    } catch (error) {
      console.error(error);
      return 'error';
    }
  }
}
