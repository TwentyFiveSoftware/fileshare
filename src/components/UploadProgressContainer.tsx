import React, { FunctionComponent } from 'react';
import styles from '../styles/UploadProgressContainer.module.scss';
import Container from './Container';
import LoadingAnimation from './LoadingAnimation';

interface Props {
    filesUploaded: number;
    filesTotal: number;
    bytesUploaded: number;
    bytesTotal: number;
}

const UploadProgressContainer: FunctionComponent<Props> = ({
    filesUploaded,
    filesTotal,
    bytesUploaded,
    bytesTotal,
}) => {
    return (
        <div className={styles.content}>
            <Container>
                <h1 className={styles.headline}>UPLOADING...</h1>
            </Container>

            <Container>
                <div className={styles.container}>
                    <LoadingAnimation />

                    <b className={styles.textBig}>
                        {filesUploaded} / {filesTotal} files
                    </b>
                    <span className={styles.text}>
                        {(bytesUploaded / 1000).toFixed(1)} MB /{' '}
                        {(bytesTotal / 1000).toFixed(1)} MB (
                        {((bytesUploaded * 100) / bytesTotal).toFixed(1)}%)
                    </span>
                </div>
            </Container>
        </div>
    );
};

export default UploadProgressContainer;
