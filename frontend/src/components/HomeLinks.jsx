import React from 'react'
import ListGroup from 'react-bootstrap/ListGroup';

function HomeLinks() {
  return (
    <div className='homeContainer'>
      <ListGroup as="ul" style={{width:"20em"}}>
        <ListGroup.Item variant='primary'>Login</ListGroup.Item>
        <ListGroup.Item variant='secondary'>Logout</ListGroup.Item>
        <ListGroup.Item variant='success'>Register</ListGroup.Item>
      </ListGroup>
    </div>
  );
}

export default HomeLinks;

