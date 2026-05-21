export function useForm(formElement) {
  const inputTitle = formElement.querySelector('#ticket-title');
  const inputDesc = formElement.querySelector('#ticket-desc');
  const errTitle = formElement.querySelector('#err-title');
  const errDesc = formElement.querySelector('#err-desc');

  function validate() {
    let isValid = true;

    if (inputTitle.value.trim().length < 5) {
      errTitle.classList.remove('hidden');
      inputTitle.classList.add('border-red-500', 'focus:ring-red-500');
      isValid = false;
    } else {
      errTitle.classList.add('hidden');
      inputTitle.classList.remove('border-red-500', 'focus:ring-red-500');
    }

    if (inputDesc.value.trim().length < 15) {
      errDesc.classList.remove('hidden');
      inputDesc.classList.add('border-red-500', 'focus:ring-red-500');
      isValid = false;
    } else {
      errDesc.classList.add('hidden');
      inputDesc.classList.remove('border-red-500', 'focus:ring-red-500');
    }

    return isValid;
  }

  function clearForm() {
    formElement.reset();
    inputTitle.classList.remove('border-red-500', 'focus:ring-red-500');
    inputDesc.classList.remove('border-red-500', 'focus:ring-red-500');
    errTitle.classList.add('hidden');
    errDesc.classList.add('hidden');
  }

  return {
    validate,
    clearForm,
    values: {
      title: () => inputTitle.value,
      desc: () => inputDesc.value
    }
  };
}