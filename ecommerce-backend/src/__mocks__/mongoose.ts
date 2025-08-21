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

export const Schema = MockSchemaConstructor
export const model = jest.fn()
export const connect = jest.fn()
export const connection = {
  on: jest.fn(),
  once: jest.fn(),
}
export const Types = MockTypes

export default {
  Schema: MockSchemaConstructor,
  model,
  connect,
  connection,
  Types: MockTypes,
}
