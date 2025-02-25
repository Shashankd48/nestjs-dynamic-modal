import { useFormik } from "formik";
import { Input, Button, Textarea, Checkbox } from "@heroui/react"; // Ensure Textarea & Checkbox are imported
import {
   autoGeneratedFields,
   generateInitialValues,
   generateValidationSchema,
   getInputType,
} from "./helper";

type Props = {
   columns: Column[];
   onSubmit: (values: Record<string, any>, cb: () => void) => Promise<void>;
   onCancel: () => void;
   values: Record<string, any>;
};

export default function CreateModelDataForm({
   columns,
   onCancel,
   onSubmit,
   values,
}: Props) {
   const filteredColumns = columns.filter(
      (col) => !autoGeneratedFields.includes(col.name)
   );

   const formik = useFormik({
      initialValues: generateInitialValues(filteredColumns, values),
      validationSchema: generateValidationSchema(filteredColumns),
      onSubmit: (values, { resetForm }) => {
         console.log("Submitted Values:", values);
         onSubmit(values, () => {
            resetForm();
         });
      },
   });

   return (
      <form onSubmit={formik.handleSubmit} className="space-y-4">
         {filteredColumns.map((field) => {
            const inputType = getInputType(field.type);
            let fieldValue = formik.values[field.name];

            return (
               <div key={field.name}>
                  {inputType === "json" ? (
                     <Textarea
                        variant="bordered"
                        label={field.name}
                        name={field.name}
                        value={
                           typeof fieldValue === "object"
                              ? JSON.stringify(fieldValue, null, 2)
                              : fieldValue || ""
                        }
                        onChange={(e) => {
                           try {
                              formik.setFieldValue(
                                 field.name,
                                 JSON.parse(e.target.value)
                              );
                           } catch (error) {
                              console.error("Invalid JSON format");
                           }
                        }}
                        onBlur={formik.handleBlur}
                        isInvalid={
                           !!formik.errors[field.name] &&
                           formik.touched[field.name]
                        }
                        errorMessage={formik.errors[field.name] as string}
                        className="w-full"
                        classNames={{ label: "capitalize" }}
                     />
                  ) : inputType === "array" ? (
                     <Textarea
                        variant="bordered"
                        label={field.name}
                        name={field.name}
                        value={
                           Array.isArray(fieldValue)
                              ? fieldValue.join(", ")
                              : ""
                        }
                        onChange={(e) => {
                           const trimmedValues = e.target.value
                              .split(",")
                              .map((item) => item.trim().replace(/^"|"$/g, ""));
                           formik.setFieldValue(field.name, trimmedValues);
                        }}
                        onBlur={formik.handleBlur}
                        isInvalid={
                           !!formik.errors[field.name] &&
                           formik.touched[field.name]
                        }
                        errorMessage={formik.errors[field.name] as string}
                        className="w-full"
                        classNames={{ label: "capitalize" }}
                        placeholder="Enter values separated by commas"
                     />
                  ) : inputType === "checkbox" ? (
                     <Checkbox
                        name={field.name}
                        isSelected={!!fieldValue}
                        onChange={(e) =>
                           formik.setFieldValue(field.name, e.target.checked)
                        }
                     >
                        {field.name}
                     </Checkbox>
                  ) : (
                     <Input
                        variant="bordered"
                        label={field.name}
                        type={inputType}
                        name={field.name}
                        value={fieldValue ?? ""}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={
                           !!formik.errors[field.name] &&
                           formik.touched[field.name]
                        }
                        errorMessage={formik.errors[field.name] as string}
                        className="w-full"
                        classNames={{ label: "capitalize" }}
                     />
                  )}
               </div>
            );
         })}

         <div className="flex justify-end gap-x-4">
            <Button type="button" color="danger" onPress={onCancel}>
               Cancel
            </Button>
            <Button type="submit" color="primary">
               {values ? "Update" : "Create"}
            </Button>
         </div>
      </form>
   );
}
