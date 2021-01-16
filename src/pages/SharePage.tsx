import React, {FunctionComponent, createRef, useEffect, useState} from 'react';
import {Redirect, useParams} from 'react-router-dom';
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
    url: string
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

            setFiles(files);
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

    switch (state) {
        case State.LOADING:
            return <div/>;

        case State.ERROR:
            return <Redirect to={'/'}/>

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

                            <Button small={true}>Download all files</Button>
                        </div>
                    </Container>

                    <section className={styles.fileContainer}>
                        {files.map(file => <FileContainer {...file} key={file.name}/>)}
                    </section>
                </div>
            );
    }
};


const FileContainer: FunctionComponent<{ name: string, size: number, url: string }> = ({name, size, url}) => {
    const downloadFile = async () => {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = name;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <div className={styles.file}>
            <div className={styles.fileTop} style={{backgroundImage: `url(${url})`}}/>
            <div className={styles.fileBottom}>
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
