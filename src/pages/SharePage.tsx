import React, {FunctionComponent, createRef, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowAltCircleDown, faClipboardList} from '@fortawesome/free-solid-svg-icons';
import firebase, {firestore} from '../firebase';
import styles from '../styles/SharePage.module.scss';
import {toHumanFileSize} from '../components/SelectedFilesContainer';
import Container from '../components/Container';
import Button from '../components/Button';

enum State {
    LOADING,
    SUCCESS,
    ERROR
}

type SharedFile = {
    name: string,
    size: number,
    url: string,
    isImage: boolean
}

const dateFormat = Intl.DateTimeFormat('de', {day: '2-digit', month: '2-digit', year: 'numeric'});

const SharePage = () => {
    const {id} = useParams<{ id: string }>();
    const [state, setState] = useState<State>(State.LOADING);
    const [files, setFiles] = useState<SharedFile[]>([]);
    const [info, setInfo] = useState<{ bytesTotal: number, availableUntil: string }>({bytesTotal: 0, availableUntil: ''});

    useEffect(() => {
        const fetchData = async () => {
            const result = await firestore.collection('share').doc(id).get();

            if (!result.exists) {
                setState(State.ERROR);
                return;
            }

            const {files, bytesTotal, availableUntil} = result.data() as { files: SharedFile[], bytesTotal: number, availableUntil: firebase.firestore.Timestamp };

            if (availableUntil.toMillis() < Date.now()) {
                setState(State.ERROR);
                return;
            }

            setFiles(files.sort((a, b) => a.isImage === b.isImage ? (a.name < b.name ? -1 : 1) : (a.isImage ? -1 : 1)));
            setInfo({bytesTotal, availableUntil: dateFormat.format(availableUntil.toDate())});

            setState(State.SUCCESS);
        }

        fetchData();
    }, [id]);

    const ref = createRef<HTMLInputElement>();

    const copyToClipboard = () => {
        ref.current?.select();
        document.execCommand('copy');
    }

    const downloadAllFiles = async () => {
        const a = document.createElement('a');
        a.style.display = 'none';
        document.body.appendChild(a);

        for (const file of files) {
            const response = await fetch(file.url);
            const blob = await response.blob();

            a.href = URL.createObjectURL(blob);
            a.download = file.name;
            a.click();
        }

        document.body.removeChild(a);
    }

    switch (state) {
        case State.LOADING:
            return <div/>;

        case State.ERROR:
            return (
                <div className={styles.content}>
                    <Container>
                        <h1 className={styles.headline}>No files available!</h1>
                        <h1 className={styles.headline}>Your URL may be wrong or has already expired!</h1>
                    </Container>
                </div>
            );

        case State.SUCCESS:
            return (
                <div className={styles.content}>
                    <Container>
                        <h1 className={styles.headline}>SHARED FILES</h1>
                    </Container>

                    <Container small={true}>
                        <div className={styles.inputContainer}>
                            <input className={styles.input} readOnly ref={ref} value={window.location.href}/>

                            <FontAwesomeIcon icon={faClipboardList} className={styles.inputCopy} onClick={() => copyToClipboard()}/>
                        </div>
                    </Container>

                    <Container small={true}>
                        <div className={styles.info}>
                            <div className={styles.text}>{files.length} file{files.length !== 1 ? 's' : ''}</div>
                            <div className={styles.dot}/>
                            <div className={styles.text}>{toHumanFileSize(info.bytesTotal)}</div>
                            <div className={styles.dot}/>
                            <div className={styles.text}>Available until {info.availableUntil}</div>

                            <div className={styles.spacer}/>

                            <Button small={true} onClick={() => downloadAllFiles()}>Download all files</Button>
                        </div>
                    </Container>

                    <section className={styles.fileContainer}>
                        {files.map(file => <FileContainer {...file} key={file.name}/>)}
                    </section>
                </div>
            );
    }
};


const FileContainer: FunctionComponent<SharedFile> = ({name, size, url, isImage}) => {
    const downloadFile = async () => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = name;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <div className={styles.file}>
            {isImage && <div className={styles.fileTop} style={{backgroundImage: `url(${url})`}}/>}
            <div className={isImage ? styles.fileBottom : styles.fileBottom__noImage}>
                <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{name}</div>
                    <div className={styles.fileSize}>{toHumanFileSize(size)}</div>
                </div>
                <div className={styles.fileIcon} onClick={() => downloadFile()}><FontAwesomeIcon icon={faArrowAltCircleDown}/></div>
            </div>
        </div>
    );
}


export default SharePage;
