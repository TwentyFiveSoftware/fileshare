import React, {FunctionComponent, useCallback, useState} from 'react';
import {FileRejection, useDropzone} from 'react-dropzone';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/HomePage.module.scss';
import Container from '../components/Container';
import Button from '../components/Button';
import DropdownMenu from '../components/DropdownMenu';
import SelectedFilesContainer from '../components/SelectedFilesContainer';
import UploadProgressContainer from '../components/UploadProgressContainer';

const timeOptions: { label: string; value: number }[] = [
    {label: '1 day', value: 1},
    {label: '2 days', value: 2},
    {label: '3 days', value: 3},
    {label: '7 days', value: 7},
    {label: '14 days', value: 14},
];

const HomePage: FunctionComponent = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            const filteredFiles = acceptedFiles.filter(
                (file) => !selectedFiles.some((f) => f.name === file.name),
            );

            setSelectedFiles((files) => [...files, ...filteredFiles]);

            if (filteredFiles.length !== acceptedFiles.length)
                alert(
                    `${
                        acceptedFiles.length - filteredFiles.length
                    } file(s) with the same name is/are already selected!`,
                );

            if (fileRejections.length > 0)
                alert(
                    `${fileRejections.length} file(s) exceeds the maximum file size of 3 GB!`,
                );
        },
        [selectedFiles],
    );

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        maxSize: 3000000000,
    });

    const removeFile = useCallback((file: File) => {
        setSelectedFiles((files) => files.filter((f) => f !== file));
    }, []);

    const generateLink = useCallback(() => {
        setUploading(true);
    }, []);

    if (uploading)
        return (
            <UploadProgressContainer
                filesUploaded={0}
                filesTotal={1}
                bytesUploaded={0}
                bytesTotal={10000}
            />
        );

    return (
        <div
            className={
                selectedFiles.length > 0
                    ? styles.content__selected
                    : styles.content
            }
            {...getRootProps()}
        >
            <Container gridArea={'headline'}>
                <h1 className={styles.headline}>UPLOAD FILES</h1>
            </Container>

            <div className={styles.left}>
                <Container>
                    <FileUploadContainer/>

                    <input
                        className={styles.input}
                        id={'input'}
                        {...getInputProps()}
                    />
                </Container>

                {selectedFiles.length > 0 && (
                    <Container>
                        <div className={styles.inline}>
                            <span>Available for</span>
                            <DropdownMenu options={timeOptions}/>
                        </div>
                        <Button onClick={generateLink}>Generate Link</Button>
                    </Container>
                )}
            </div>

            {selectedFiles.length > 0 && (
                <Container gridArea={'selectedFiles'}>
                    <SelectedFilesContainer
                        selectedFiles={selectedFiles}
                        removeFile={removeFile}
                    />
                </Container>
            )}

            {isDragActive && <div className={styles.dropIndicator}/>}
        </div>
    );
};

const FileUploadContainer = () => (
    <div className={styles.fileUpload}>
        <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.icon}/>
        <strong className={styles.textBig}>Drag and Drop files</strong>
        <span className={styles.textSmall}>or</span>
        <label htmlFor={'input'}>
            <Button>Browse</Button>
        </label>
    </div>
);

export default HomePage;
