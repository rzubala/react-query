import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http'
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Header from '../Header.jsx';
import Modal from '../UI/Modal';
import { useState } from 'react';

export default function EventDetails() {
  const [isDeleting, setIsDeleting ] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { id }],
    queryFn: ({signal}) => fetchEvent({ signal, id })
  });
  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      });
      navigate('/events');
    }
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  async function handleDelete(event) {
    mutate({ id });
  }

  return (
    <>
      {isDeleting && <Modal onClose={handleStopDelete}>
        <h2>Arey you sure?</h2>
        <p>Really?</p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Deleting, please wait</p>}
          {!isPendingDeletion && (
            <>
              <button onClick={handleStopDelete}>Cancel</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </div>
        {isErrorDeleting && <ErrorBlock title="Failed to delete" message={deleteError.info?.message ?? 'Failed to delete event'} /> }
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Loading...</p>}
      {isError && <ErrorBlock title="An error occured" message="Try again later" />}
      {data && <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete} >Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{`${data.date} ${data.time}`}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>}
    </>
  );
}
