import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      
      await queryClient.cancelQueries({queryKey: ['events', params.id]});
      const previousEvent = queryClient.getQueriesData(['events', params.id]);
      
      queryClient.setQueryData(['events', params.id], newEvent);
      return { previousEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', params.id], context.previousEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', params.id]);
    }
  });

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['event', params.id],
    queryFn: ({signal}) => fetchEvent({id: params.id, signal})
  });

  function handleSubmit(formData) {
    mutate({id: params.id, event: formData})
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;
  if (isPending) {
    content = <div className='center'>
      <LoadingIndicator />
    </div>
  }
  if (isError) {
    content = (
    <>
      <ErrorBlock title="An error occured" message={error.info?.message ?? 'Failed to load event.'}/>
      <div className='form-actions'>
        <Link to="../" className='button'>
          Ok
        </Link>
      </div>
    </>)
  }
  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
