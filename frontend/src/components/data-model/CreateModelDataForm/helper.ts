// Columns to exclude from the form
import * as Yup from "yup";

export const autoGeneratedFields = ["id", "createdAt", "updatedAt"];

export const generateInitialValues = (
   schema: Column[],
   values?: FormValues
): FormValues => {
   const initialValues: FormValues = {};

   schema.forEach((field) => {
      if (!autoGeneratedFields.includes(field.name)) {
         let value: string | number | boolean | undefined =
            values?.[field.name] ?? "";

         if (field.type === "UUID") {
            value =
               typeof values?.[field.name] === "string"
                  ? values[field.name]
                  : crypto.randomUUID();
         } else if (field.type === "TIMESTAMP" || field.type === "DATE") {
            // Ensure value is a valid string or number before passing to `new Date()`
            if (
               typeof values?.[field.name] === "string" ||
               typeof values?.[field.name] === "number"
            ) {
               value = new Date(values[field.name] as string)
                  .toISOString()
                  .split("T")[0];
            } else {
               value = ""; // Default to empty string if invalid
            }
         }

         initialValues[field.name] = value;
      }
   });

   return initialValues;
};

// Function to generate validation schema
export const generateValidationSchema = (schema: Column[]) => {
   const validationSchema: Record<string, Yup.AnySchema> = {};

   schema.forEach((field) => {
      if (!autoGeneratedFields.includes(field.name)) {
         let validator: Yup.AnySchema = Yup.string(); // Default to string

         if (field.type === "UUID") {
            validator = Yup.string().uuid("Invalid UUID format");
         } else if (field.type === "VARCHAR") {
            validator = Yup.string().required(`${field.name} is required`);
         } else if (field.type === "TIMESTAMP") {
            validator = Yup.date().required(`${field.name} is required`);
         }

         if (field.isNotNull) {
            validator = validator.required(`${field.name} is required`);
         }

         validationSchema[field.name] = validator;
      }
   });

   return Yup.object().shape(validationSchema);
};

export const getInputType = (type: string) => {
   switch (type.toLowerCase()) {
      case "date":
         return "date";

      default:
         return "text";
   }
};
