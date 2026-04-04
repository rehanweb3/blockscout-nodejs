import React from 'react';

export default function useTableViewValue(): boolean {
  const [ value ] = React.useState(false);
  return value;
}
