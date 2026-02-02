exports.createSchemaCustomization = ({ actions }) => {
    actions.createTypes(`
        type ProjectVideo {
            embedUrl: String
            title: String
        }
        type Project {
            visible: Boolean
            category: String
            title: String
            description: String
            tags: [String]
            image: LinkedImage
            links: [ProjectLink]
            video: ProjectVideo
        }
    `);
};
