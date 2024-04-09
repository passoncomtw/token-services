const sm = 60;
const md = 90;
const lg = 120;

const getDifferentCondition = base => ({
  normal: base,
  selector: base - 10,
  groupSelector: base - 16,
});

const labelSize = {
  sm: getDifferentCondition(sm),
  md: getDifferentCondition(md),
  lg: getDifferentCondition(lg),
};

export default labelSize;
