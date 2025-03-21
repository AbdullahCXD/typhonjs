import { TyphonLogger } from "../TyphonLogger";

export default class Messages {

    static printUnpackagablePlugin(logger: TyphonLogger) {
        logger.error("Plugin building is restricted! You cannot package/build a plugin project.")
        logger.startSection("Ways to release a plugin:");
        logger.info("> Use the preferred package manager to release the plugin");
        logger.info("> Preferrably you should start the plugin name with `typhon-` so it's easier to find.")
    }

}