import React, {useEffect, useRef, useState} from "react";
import {Form, Field, FieldArray, Formik, useFormikContext} from "formik";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {useDispatch} from "react-redux";
import * as yup from "yup";
import {wrapComponent} from "react-snackbar-alert";
import {useHistory, useParams} from "react-router";
import IconButton from "@material-ui/core/IconButton";
import {CategoryActions} from "../../../redux/actions/categoryActions";
import {AttributeActions} from "../../../redux/actions/attributeActions";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutline from '@material-ui/icons/RemoveCircleOutline'
import {ProductActions} from "../../../redux/actions/productActions";

const validationSchema = yup.object({
    name: yup.string("Enter Category").required("Category is required")
});

const CategoryForm = wrapComponent(function ({createSnackbar}) {
    const dispatch = useDispatch();
    const history = useHistory();
    const {categoryId} = useParams();
    const formikRef = useRef(null)
    const [attributeIdsToRemove, setAttributeIdsToRemove] = useState([])

    const initialValues = {
        name: "",
        attributes: []
    };

    function onChangeAttribute(e, field, values, setValues, action, i) {
        if(Boolean(categoryId) && action === "delete"){
            deleteAttribute(values.attributes[i].id, false)
        }
        const attributes = [...values.attributes];
        if(action === "add"){
            attributes.push({
                id: -1,
                name: "",
                suffix: "",
                categoryId: -1,
                numeric: false
            })
        }
        else if(action === "delete"){
            attributes.splice(i, 1)
        }
        setValues({ ...values, attributes });
        field.onChange(e);
    }

    useEffect(() => {
        if (Boolean(categoryId)) {
            dispatch(CategoryActions.fetchCategory(categoryId, (success, response) => {
                if (Boolean(success)) {
                    formikRef.current.setFieldValue("name", response.data.name)
                    dispatch(AttributeActions.fetchAttributesByCategory(categoryId, (success, response) => {
                        setTimeout(function (){ //da ne se pojavi error dodeka refreshne, ako mozhe
                            if(Boolean(success)){//bolje reshenie da se najde bi bilo top (da odma se pojavat atributi bez refresh)
                                formikRef.current.setFieldValue("attributes", response.data)
                            }
                            else {
                                createSnackbar({
                                    message: 'Attributes fetching error!',
                                    timeout: 2500,
                                    theme: 'error'
                                });
                            }
                        }, 0)
                    }))
                } else {
                    createSnackbar({
                        message: 'Category not found!',
                        timeout: 2500,
                        theme: 'error'
                    });
                    history.goBack();
                }
            }));
        }
    }, []);

    function submitCategory(values){
        if (categoryId) {
            deleteAttribute(-1, true)
            dispatch(
                CategoryActions.updateCategory(categoryId, values, success => {
                    createSnackbar({
                        message: success ? "Successfully Updated Category" : "Category failed to Update",
                        timeout: 2500,
                        theme: success ? "success" : "error",
                    });
                    if(values.attributes.length>0)
                        updateAttributes(values)
                })
            );
        } else {
            dispatch(
                CategoryActions.addCategory(values, (success, response) => {
                    createSnackbar({
                        message: success ? "Successfully created category" : "Category failed to create",
                        timeout: 2500,
                        theme: success ? "success" : "error",
                    });
                    success && history.push(`/categories/edit/${response.data.id}`);
                    if(values.attributes.length>0)
                        addAttributes(values, response.data.id)
                })
            );
        }
    }

    function addAttributes(values, cat_id){
        values.attributes.forEach(attr => attr.categoryId = cat_id)
        dispatch(
            AttributeActions.addAttributes(values.attributes, (success, response) => {
                //window.location.reload()
            })
        );
    }

    function updateAttributes(values){
        let attributesToAdd = []
        values.attributes.forEach(attr => {
            if(attr.id === -1){
                attributesToAdd.push(attr)
            }
            else{
                dispatch(
                    AttributeActions.updateAttribute(attr, (success, response) => {
                        //window.location.reload()
                    })
                )
            }
        })
        attributesToAdd.forEach(attr => attr.categoryId = categoryId)
        dispatch(
            AttributeActions.addAttributes(attributesToAdd, (success, response) => {
                //window.location.reload()
            })
        );
    }

    function deleteAttribute(id, final){
        if(final) {
            let i=0;
            function deleteCategoryAttribute(attr_id){
                dispatch(
                    AttributeActions.deleteAttribute(attr_id, (success, response) => {
                        i++
                        if(i<attributeIdsToRemove.length)
                            deleteCategoryAttribute(attributeIdsToRemove[i])
                    })
                )
            }
            deleteCategoryAttribute(attributeIdsToRemove[i])
        }
        else{
            setAttributeIdsToRemove([...attributeIdsToRemove, id])
        }
    }

    return (
        <div className={`container p-5 w-50`}>
            <h3>
                {Boolean(categoryId) ? 'Edit Category' : 'Create Category'}
            </h3>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submitCategory} innerRef = {formikRef}>
            {({errors, values, touched, setValues, handleChange}) => (
            <Form className={`text-center pt-4`}>
                <TextField
                    className={``}
                    fullWidth
                    name={`name`}
                    label="Category name"
                    type="name"
                    onChange={handleChange}
                    value={values.name}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                />
                <div className={'row'}>
                    <h3 className={'text-start pt-4 pb-1 col-6'}>
                        {"Attributes"}
                    </h3>
                    <div className={'col-4'}/>
                    <Field>
                        {({ field }) => (
                            <div className={"col-2 pt-2"}>
                                <IconButton aria-label="add"
                                            className={''}
                                            onClick={e => onChangeAttribute(e, field, values, setValues, "add")}
                                >
                                    <AddCircleOutlineIcon />
                                </IconButton>
                            </div>
                        )}
                    </Field>
                </div>
                <FieldArray name="attributes">
                    {() => (values.attributes.map((attribute, i) => {
                        return (
                            <div key={i} className="list-group list-group-flush">
                                <div className="list-group-item">
                                    <div className="form-row row">
                                        <div className="form-group col-4">
                                            <TextField
                                                className={``}
                                                fullWidth
                                                name={`attributes.${i}.name`}
                                                label="Attribute name"
                                                type="name"
                                                onChange={handleChange}
                                                value={values.attributes[i].name}
                                            />
                                        </div>
                                        <div className="form-group col-3">
                                            <label>Numeric</label>
                                            <br/>
                                            <Select
                                                name={`attributes.${i}.numeric`}
                                                onChange={handleChange}
                                                value={values.attributes[i].numeric}
                                            >
                                                <MenuItem value={true}>True</MenuItem>
                                                <MenuItem value={false}>False</MenuItem>
                                            </Select>
                                        </div>
                                        <div className="form-group col-4">
                                            <TextField
                                                className={``}
                                                fullWidth
                                                name={`attributes.${i}.suffix`}
                                                label="Attribute suffix"
                                                type="name"
                                                onChange={handleChange}
                                                value={values.attributes[i].suffix}
                                            />
                                        </div>
                                        <div className={"form-group col-1"}>
                                            <Field>
                                                {({ field }) => (
                                                    <div className={"col-2 pt-2"}>
                                                        <IconButton aria-label="delete"
                                                            className={''}
                                                            onClick={e => onChangeAttribute(e, field, values, setValues, "delete", i)}
                                                            >
                                                        <RemoveCircleOutline />
                                                    </IconButton>
                                                    </div>
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }))}
                </FieldArray>
                <div className={`pt-3 float-left`}>
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                    >
                        {categoryId ? "Edit" : "Create"}
                    </Button>
                    <Button
                        color="primary"
                        href={'/admin'}
                    >
                        Exit
                    </Button>
                </div>
            </Form>
                )}
            </Formik>
        </div>
    );
});

export default CategoryForm;
