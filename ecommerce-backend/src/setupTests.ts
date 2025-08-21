import { jest } from '@jest/globals'

jest.mock('mongoose', () => {
  const mockSchema = {
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {},
    virtual: jest.fn(),
    plugin: jest.fn(),
  }

  function MockSchemaConstructor(definition: any, options?: any) {
    return mockSchema
  }

  const MockTypes = {
    ObjectId: jest.fn(),
    Mixed: {},
    String: String,
    Number: Number,
    Date: Date,
    Boolean: Boolean,
    Array: Array,
  }

  MockSchemaConstructor.Types = MockTypes

  const mockModel = jest.fn().mockImplementation(() => ({
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    populate: jest.fn(),
  }))

  return {
    Schema: MockSchemaConstructor,
    model: mockModel,
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
    },
    Types: MockTypes,
    default: {
      Schema: MockSchemaConstructor,
      model: mockModel,
      connect: jest.fn(),
      connection: {
        on: jest.fn(),
        once: jest.fn(),
      },
      Types: MockTypes,
    }
  }
})

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}
