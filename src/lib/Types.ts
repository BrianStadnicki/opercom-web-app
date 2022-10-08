export interface DataSideTeam {
    id: string,
    name: string,
    channels: DataSideTeamChannel[]
}

export interface DataSideTeamChannel {
    id: string,
    name: string
}

export interface DataChannel {
    _metadata: {
        syncState: string,
        lastCompleteSegmentStartTime: number,
        lastCompleteSegmentEndTime: number,
        backwardLink: string
    },
    messages: DataMessage[],
    tenantId: string
}

export interface DataMessage {
    clientmessageid?: string,
    composetime: string,
    content: string,
    contenttype?: string,
    conversationLink: string,
    conversationid: string,
    draftDetails: object,
    from: string,
    fromTenantId: string,
    id: string,
    imdisplayname?: string,
    messagetype: string,
    originalarrivaltime: string,
    properties: {
        cards?: string,
        subject?: string,
        title?: string,
        files?: string,
        deletetime?: number
    }
    sequenceId: number,
    type: string,
    version: string,
}

export interface DataFile {
    "@type": string,
    baseUrl: string,
    botFileProperties: object,
    fileChicletState: {
        serviceName: string,
        state: string
    },
    fileInfo: {
        fileUrl: string,
        serverRelativeUrl: string,
        siteUrl: string,
    },
    fileName: string,
    filePreview: object,
    fileType: string,
    id: string,
    itemid: string,
    objectUrl: string,
    providerData: string,
    sourceOfFile: number,
    state: string,
    title: string,
    type: string
}
