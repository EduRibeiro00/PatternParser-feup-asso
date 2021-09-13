import { IPlainTextAuthorStrategy } from './IPlainTextAuthorStrategy';
import { Author, checkIfPlopEmail } from '../../../ParserUtils';
import { getNames } from 'country-list';

class PlainTextParagraphAuthorStrategy implements IPlainTextAuthorStrategy {
    public parseAuthors(file: string, url : string) : Author[] {
        const preIntroduction = file.split(/1\.\s*Introduction\s*/i)[0];
        const sentences = preIntroduction.split('\n');

        const authorsInfo = [];

        for(let i = 0; i < sentences.length; i++) {
            let currentSentence = sentences[i];
            let currentSentenceSplit = currentSentence.split(",");

            if(currentSentenceSplit.length < 2) {
                continue;
            }

            if(checkIfPlopEmail(currentSentence, currentSentenceSplit)) {
                if(i < sentences.length - 1) {
                    const nextSentence = sentences[i+1];
                    if(checkIfPlopEmail(nextSentence, nextSentence.split(","))) {
                        authorsInfo.push(currentSentence);
                    }else {
                        if(nextSentence.length < currentSentence.length * 3 / 4) {
                            const fullSentence = currentSentence.concat(" " + nextSentence);
                            authorsInfo.push(fullSentence);
                            i++;
                        }else {
                            authorsInfo.push(currentSentence);
                            break;
                        }
                    }
                }
            }
        }

        const authorArray: Author[] = [];
        const countries = getNames();
        countries.push("USA");

        authorsInfo.forEach( (author) => {
            let name = "", email = "", organization = "", country = "";
            let splitAuthor = author.split(',');
            name = splitAuthor[0];
            splitAuthor.forEach((element) =>{
                const noWhitespace = element.trim();

                if(element.indexOf("@") != -1){
                    email = noWhitespace;
                    return;
                }

                if(element.includes("University")){
                    organization = noWhitespace;
                    return;
                }

                if(countries.includes(noWhitespace)){
                    country = noWhitespace;
                    return;
                }
            })

            if(organization === ""){
                if(country === ""){
                    if(splitAuthor.length > 1) organization = splitAuthor[splitAuthor.length-1].trim();
                }else{
                    if(splitAuthor.length > 2) organization = splitAuthor[splitAuthor.length-2].trim();
                }
            }

            const authorObject = {
                "name": name,
                "email": email,
                "organization": organization,
                "country": country,
            }

            authorArray.push(authorObject);
        });

        const splitAddress = file.split(/Author['|’]s( email| e-mail)? address[:]?[ ]?|Authors['|’]( email| e-mail)? address[es]?[:]?[ ]?|Author['|’]s e[-]?mail[:]?[ ]?|Authors['|’] e[-]?mail[:]?[ ]?|Corresponding authors?:/i).filter(Boolean);;

        if(splitAddress.length > 1){
            const authorAddresses = splitAddress[1].split(/Permission to make digital or hard copies/i)[0].replace(/(\r\n|\r|\n)/,"");

            const splitEmail = authorAddresses.split(/email: |e-mail: /i);

            if(splitEmail.length > 1)
                splitEmail.shift();

            if(splitEmail.length === authorsInfo.length){
                splitEmail.forEach((emailSentence, i) => {
                    if(authorArray[i].email === ""){
                        authorArray[i].email = emailSentence.split(';')[0].replace("\n", "");
                    }
                })
            }else if(splitEmail.length === 1){
                const emailLine = splitEmail[0];
                if(emailLine.split("@").length === authorsInfo.length + 1) {
                    emailLine.split(/; and |; /i).forEach((emailSentence, i) => {
                        if (authorArray[i].email === "")
                            authorArray[i].email = emailSentence.replace("\n", "");
                    })
                }else if(emailLine.includes("@") && emailLine[0].match(/[{\[(]/i)){
                    const names = emailLine.split(/[}\])]/i)[0].replace(/[{\[(]/i, "").split(/[;,] ?/i);
                    const emailProvider = emailLine.split("@")[1].replace("\n", "").split(" ")[0];
                    names.forEach((name, i) => {
                        if (authorArray[i].email === "")
                            authorArray[i].email = name + "@" + emailProvider;
                    })
                } else{
                    splitEmail.forEach((emailSentence, i) => {
                        if(authorArray[i].email === ""){
                            authorArray[i].email = emailSentence.split(/[;,]/i)[0].replace("\n", "");
                        }
                    })
                }
            }
        }

        return authorArray;
    }
}

export { PlainTextParagraphAuthorStrategy }