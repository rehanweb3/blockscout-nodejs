import React from 'react';

type GradualIncrementResult = [
  number,
  (value: number) => void,
];

export default function useGradualIncrement(initialValue = 0): GradualIncrementResult {
  const [ value, setValue ] = React.useState(initialValue);

  const setNum = React.useCallback((newValue: number) => {
    setValue(newValue);
  }, []);

  return [ value, setNum ];
}
