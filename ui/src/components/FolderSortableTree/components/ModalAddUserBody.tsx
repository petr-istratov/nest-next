import { Box, Form, FormField, TextInput } from 'grommet';
import { useEffect, useState } from 'react';

const ModalAddUserBody = () => {
  const [values, setValues] = useState<{
    [key: string]: string | boolean;
  }>({
    valid: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string | boolean }>({
    firstName: true,
    lastName: true,
  });

  useEffect(() => {
    setValues((prevState) => {
      prevState.valid = !Object.values(errors).some((value) => value === true || value === ``);
      return prevState;
    });
  }, [errors]);

  const setFormValues = (event: any) => {
    const temp: { [key: string]: string | boolean } = {
      ...values,
    };
    const tempError: { [key: string]: string | boolean } = { ...errors };
    temp[event.name] = event.value;
    tempError[event.name] =
      !event.value ||
      (typeof event.value === `string` && event.value.trim() === ``) ||
      (typeof event.value === `string` && event.value.trim().length <= 2)
        ? true
        : false;

    setErrors(tempError);
    setValues(temp);
  };

  return (
    <Form value={values}>
      <FormField name="course" error={errors.firstName || errors.lastName && `Please enter values`} pad>
        <Box width="medium" gap={'10px'}>
          <TextInput 
            placeholder="Type first name..."
            onChange={(event) => setFormValues({ name: 'firstName', value: event.target.value })}
          />
          <TextInput 
            placeholder="Type last name..."
            onChange={(event) => setFormValues({ name: 'lastName', value: event.target.value })}
          />
        </Box>
      </FormField>
    </Form>
  );
};

export default ModalAddUserBody;
