const Validator = require('../Validator');
const expect = require('chai').expect;

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    it('валидатор проверяет типы данных', () => {
      const dataProvider = [
        {
          validatorParams: {
            name: {
              type: 'string',
              min: 5,
              max: 20,
            },
          },
          validateObject: {
            name: 20,
          },
          expected: {
            field: 'name',
            error: 'expect string, got number',
          },
        },
        {
          validatorParams: {
            age: {
              type: 'number',
              min: 5,
              max: 20,
            },
          },
          validateObject: {
            age: '15',
          },
          expected: {
            field: 'age',
            error: 'expect number, got string',
          },
        },
      ];

      dataProvider.forEach((row) => {
        const validator = new Validator(row.validatorParams);
        const errors = validator.validate(row.validateObject);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(row.expected.field);
        expect(errors[0]).to.have.property('error').and.to.be.equal(row.expected.error);
      });
    });

    it('валидатор проверяет строковые поля на длину строки', () => {
      const dataProvider = [
        {
          validatorParams: {
            name: {
              type: 'string',
              min: 10,
              max: 20,
            },
          },
          validateObject: {
            name: 'Lalala',
          },
          expected: {
            field: 'name',
            error: 'too short, expect 10, got 6',
          },
        },
        {
          validatorParams: {
            name: {
              type: 'string',
              min: 10,
              max: 20,
            },
          },
          validateObject: {
            name: 'Lalala Lalala Lalala Lalala',
          },
          expected: {
            field: 'name',
            error: 'too long, expect 20, got 27',
          },
        },
        {
          validatorParams: {
            name: {
              type: 'string',
              min: 20,
              max: 10,
            },
          },
          validateObject: {
            name: 'Lalala',
          },
          expected: {
            field: 'name',
            error: 'rules.min 20 more than rules.max 10',
          },
        },
      ];

      dataProvider.forEach((row) => {
        const validator = new Validator(row.validatorParams);
        const errors = validator.validate(row.validateObject);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(row.expected.field);
        expect(errors[0]).to.have.property('error').and.to.be.equal(row.expected.error);
      });
    });
  });

  it('валидатор проверяет числовые поля на корректность данных', () => {
    const dataProvider = [
      {
        validatorParams: {
          age: {
            type: 'number',
            min: 10,
            max: 20,
          },
        },
        validateObject: {
          age: 9,
        },
        expected: {
          field: 'age',
          error: 'too little, expect 10, got 9',
        },
      },
      {
        validatorParams: {
          age: {
            type: 'number',
            min: 10,
            max: 20,
          },
        },
        validateObject: {
          age: 21,
        },
        expected: {
          field: 'age',
          error: 'too big, expect 20, got 21',
        },
      },
      {
        validatorParams: {
          age: {
            type: 'number',
            min: 20,
            max: 10,
          },
        },
        validateObject: {
          age: 15,
        },
        expected: {
          field: 'age',
          error: 'rules.min 20 more than rules.max 10',
        },
      },
    ];

    dataProvider.forEach((row) => {
      const validator = new Validator(row.validatorParams);
      const errors = validator.validate(row.validateObject);

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal(row.expected.field);
      expect(errors[0]).to.have.property('error').and.to.be.equal(row.expected.error);
    });
  });
});
