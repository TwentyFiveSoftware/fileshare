import React, {FunctionComponent, useCallback, useState} from 'react';
import {FileRejection, useDropzone} from 'react-dropzone';
import {Redirect} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons';
import {nanoid} from 'nanoid';
import firebase, {storage, firestore} from '../firebase';
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

type UploadInfo = {
    filesUploaded: number,
    filesTotal: number,
    bytesUploaded: number,
    bytesTotal: number,
    id: string
}

enum State {
    SELECTING,
    UPLOADING,
    FINISHED
}

const HomePage: FunctionComponent = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadInfo, setUploadInfo] = useState<UploadInfo>({filesUploaded: 0, filesTotal: 1, bytesUploaded: 0, bytesTotal: 1, id: ''});
    const [state, setState] = useState<State>(State.SELECTING);
    const [timeIndex, setTimeIndex] = useState<number>(0);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            const filteredFiles = acceptedFiles.filter((file) => !selectedFiles.some((f) => f.name === file.name));

            setSelectedFiles((files) => [...files, ...filteredFiles].sort((a, b) => a.name < b.name ? -1 : 1));

            if (filteredFiles.length !== acceptedFiles.length)
                if (acceptedFiles.length - filteredFiles.length === 1)
                    alert(`1 file has a name that already exists!`);
                else
                    alert(`${acceptedFiles.length - filteredFiles.length} files have a name that already exists!`);

            if (fileRejections.length > 0) {
                if (fileRejections.length === 1)
                    alert(`1 file exceeds the maximum file size of 3 GB!`);
                else
                    alert(`${fileRejections.length} files exceed the maximum file size of 3 GB!`);
            }
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
        setState(State.UPLOADING);

        const id = nanoid();
        const progress: Map<string, { bytesTransferred: number, running: boolean }> = new Map();
        let bytesTotal = 0;

        const updateUploadingInfo = () => {
            const arr = Array.from(progress.values());
            const bytesUploaded = arr.reduce((sum, info) => sum + info.bytesTransferred, 0);
            const filesUploaded = arr.reduce((sum, info) => sum + (info.running ? 0 : 1), 0);
            setUploadInfo({bytesTotal, bytesUploaded, filesUploaded, filesTotal: selectedFiles.length, id});
        }

        const databaseInfo: { name: string, url: string, size: number, path: string, isImage: boolean }[] = [];

        for (const file of selectedFiles) {
            const task = storage.ref(`${id}/${file.name}`).put(file);
            bytesTotal += task.snapshot.totalBytes;

            task.on(firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                    progress.set(snapshot.ref.name, {bytesTransferred: snapshot.bytesTransferred, running: true});
                    updateUploadingInfo();
                },
                null,
                // eslint-disable-next-line no-loop-func
                async () => {
                    const {ref, ref: {name}, totalBytes} = task.snapshot;
                    progress.set(name, {bytesTransferred: totalBytes, running: false});
                    updateUploadingInfo();

                    const url = await task.snapshot.ref.getDownloadURL();
                    databaseInfo.push({name, url, size: totalBytes, path: ref.fullPath, isImage: file.type.startsWith('image/')});

                    if (!Array.from(progress.values()).some(info => info.running)) {
                        await firestore.collection('share').doc(id).set({
                            id,
                            files: databaseInfo,
                            bytesTotal,
                            availableUntil: new Date(Date.now() + timeOptions[timeIndex].value * 24 * 3600000)
                        });

                        setState(State.FINISHED);
                    }
                });
        }

    }, [selectedFiles, timeIndex]);


    switch (state) {
        case State.FINISHED:
            return <Redirect to={`/share/${uploadInfo.id}`}/>;

        case State.UPLOADING:
            return (
                <UploadProgressContainer
                    filesUploaded={uploadInfo.filesUploaded}
                    filesTotal={uploadInfo.filesTotal}
                    bytesUploaded={uploadInfo.bytesUploaded}
                    bytesTotal={uploadInfo.bytesTotal}
                />
            );

        case State.SELECTING:
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
                                    <DropdownMenu options={timeOptions} selectedIndexChange={(newTimeIndex: number) => setTimeIndex(newTimeIndex)}/>
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
    }
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
