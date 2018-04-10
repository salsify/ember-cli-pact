// Workaround to support wrapping mirage serializers in PactEnabled outside of the test environment
export function PactEnabled(SerializerClass) {
  return SerializerClass
}
