const sortArrayByProp = (prop) => (a, b) => {
  const subCheck = (b[prop].toLowerCase() > a[prop].toLowerCase()) ? -1 : 0;
  return (a[prop].toLowerCase() > b[prop].toLowerCase()) ? 1 : subCheck;
};

export default sortArrayByProp;