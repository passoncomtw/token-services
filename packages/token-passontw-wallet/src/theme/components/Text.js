import { fontSize } from '../font';

// return { h1Style: { fontSize: 42 } }
const getStyle = (type) => ({
  [`${type}Style`]: { fontSize: fontSize[type] },
});

const Text = {
  ...getStyle('h1'),
  ...getStyle('h2'),
  ...getStyle('h3'),
  ...getStyle('h4'),
  ...getStyle('h5'),
  ...getStyle('h6'),
};

export default Text;
