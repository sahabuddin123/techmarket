import React from 'react';
import NotFound from './Errors/NotFound';

export default function Error(props) {
  const status = props.status || 404;

  if (status === 404) {
    return <NotFound {...props} />;
  }

  return <NotFound {...props} />;
}
