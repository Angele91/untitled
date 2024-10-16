import * as Yup from "yup";
import Modal from "../utility/modal.tsx";
import { Field, Form, Formik, FormikHelpers } from "formik";
import EyeSaverModeToggle from "./EyeSaverModeToggle";

const SettingsSchema = Yup.object().shape({
  wordGroupSize: Yup.number()
    .min(1, "Must be at least 1")
    .max(10, "Must be at most 10")
    .required("Required"),
});

interface SettingsFormValues {
  wordGroupSize: number;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  wordGroupSize,
  setWordGroupSize,
}: {
  isOpen: boolean;
  onClose: () => void;
  wordGroupSize: number;
  setWordGroupSize: (value: number) => void;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Reading Settings">
    <Formik
      initialValues={{ wordGroupSize }}
      validationSchema={SettingsSchema}
      onSubmit={(
        values: SettingsFormValues,
        { setSubmitting }: FormikHelpers<SettingsFormValues>
      ) => {
        setWordGroupSize(values.wordGroupSize);
        setSubmitting(false);
        onClose();
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="flex flex-col items-start">
          <div className="flex items-center mb-4">
            <label htmlFor="wordGroupSize" className="text-sm mr-2">
              Words per group:
            </label>
            <Field
              id="wordGroupSize"
              name="wordGroupSize"
              type="number"
              className="w-16 text-sm border rounded px-2 py-1"
            />
          </div>
          {errors.wordGroupSize && touched.wordGroupSize ? (
            <div className="text-red-500 text-xs mb-2">
              {errors.wordGroupSize}
            </div>
          ) : null}
          <div className="mb-4">
            <EyeSaverModeToggle />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            Save
          </button>
        </Form>
      )}
    </Formik>
  </Modal>
);
