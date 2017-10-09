import Interaction from './-private/interaction';

export default class MockProvider {
  recordRequest(request, rules) {
    let interaction = Interaction.current();
    if (interaction) {
      interaction.recordRequest(request, rules);
    }
  }
}
