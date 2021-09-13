import { IPlainTextFooterStrategy } from "./IPlainTextFooterStrategy";
import { PaperInfo } from '../../../ParserUtils';

class PlainTextPlopFooterStrategy implements IPlainTextFooterStrategy {
    public parseFooter(file: string, url : string) : PaperInfo {
        //extract footer text
        const footerExp = /Permission *to *make *digital *or *hard *copies.*?HILLSIDE *[0-9-]*/gms;
        let footer = file.match(footerExp)?.toString();

        //remove newlines
        footer = footer?.replace(/[\n\r]+/g, ' ');
        let parsedFile = file.replace(/[\n\r\t]+/g, ' ');

        let conferenceName = '';
        let copyright = '';
        let conference = '';
        let conferenceDate = '';
        let conferenceLocation = '';

        if (footer) {
            //extract full conference title
            const titleExp = /at *the  *\n* *([^.]*)/gms;
            const tempConf = titleExp.exec(footer);

            if (tempConf && tempConf.length >= 2) {
                conferenceName = tempConf[1];
            }
        }

        //extract other conference details
        const dataExp = /(PLoP[’'][0-9]*), *([^,]*), *([^.]*). *([^.]*)./gms
        const tempData = dataExp.exec(parsedFile);

        if (tempData && tempData.length >= 5) {
            conference = tempData[1];
            conferenceDate = tempData[2];
            conferenceLocation = tempData[3];
            copyright = tempData[4];
        }

        return {
            url: url,
            conference_name: conferenceName,
            conference: conference,
            conference_date: conferenceDate,
            conference_location: conferenceLocation,
            copyright: copyright
        };
    }
}

export { PlainTextPlopFooterStrategy }