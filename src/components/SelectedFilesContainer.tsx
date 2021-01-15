import React, { FunctionComponent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/HomePage.module.scss';

const toHumanFileSize = (size: number) => {
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const s = Number(size / Math.pow(1024, i)).toFixed(2);
    return `${s} ${['B', 'KB', 'MB', 'GB'][i]}`;
};

const getFileType = (fileName: string) => {
    const match = fileName.match(/.*\.(.*)$/);
    return match ? match[1].toUpperCase() : '---';
};

const SelectedFilesContainer: FunctionComponent<{
    selectedFiles: File[];
    removeFile: Function;
}> = ({ selectedFiles, removeFile }) => {
    return (
        <div className={styles.files}>
            {selectedFiles.map((file) => (
                <div className={styles.file} key={file.name}>
                    <div className={styles.fileLeft}>
                        <div className={styles.fileCircle}>
                            {getFileType(file.name)}
                        </div>
                    </div>
                    <div>
                        <div className={styles.fileName}>{file.name}</div>
                        <div className={styles.fileSize}>
                            {toHumanFileSize(file.size)}
                        </div>
                    </div>
                    <div onClick={() => removeFile(file)}>
                        <FontAwesomeIcon
                            icon={faTimes}
                            className={styles.fileDelete}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
export default SelectedFilesContainer;
