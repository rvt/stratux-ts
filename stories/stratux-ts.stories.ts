import { html, TemplateResult } from 'lit';
import '../src/stratux-app.js';

export default {
  title: 'StratuxTs',
  component: 'stratux-ts',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  title?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({
  title,
  backgroundColor = 'white',
}: ArgTypes) => html`
  <stratux-ts
    style="--stratux-ts-background-color: ${backgroundColor}"
    .title=${title}
  ></stratux-ts>
`;

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
