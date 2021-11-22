import { toast } from 'react-toastify';

const popError = msg => toast(msg, { theme: 'colored', type: 'error' });
const popSuccess = msg => toast(msg, { theme: 'colored', type: 'success' });

const handleError = err => {
  if (err.detail) {
    err.detail.forEach(e => popError(e.msg));
  } else {
    popError(
      err.message ?
        err.messge :
        ( typeof(err) === 'string' ? err : err.toString() )
    );
  }
}

export { handleError, popError, popSuccess };
