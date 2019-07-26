package org.openstreetmap.josm.plugins.scripting.graalvm;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Engine;
import org.graalvm.polyglot.Language;
import org.openstreetmap.josm.plugins.scripting.model.ScriptEngineDescriptor;
import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

public class GraalVMFacade  implements IGraalVMFacade {

    private Context context;

    public GraalVMFacade() {
        // TODO(karl): initialize context
        context = Context.create();
        context.enter();
    }

    protected ScriptEngineDescriptor buildLanguageInfo(
            final Engine engine,
            final Language info) {

        //WORKAROUND: implementation name is sometimes empty. Replace
        // with a default name in this cases
        String engineName = info.getImplementationName();
        if (engineName == null || engineName.trim().isEmpty()) {
            engineName = "GraalVM";
        }
        final ScriptEngineDescriptor desc = new ScriptEngineDescriptor(
                ScriptEngineDescriptor.ScriptEngineType.GRAALVM,
                info.getId(),                 // engineId
                engineName, // engineName
                info.getName(),               // languageName
                info.getDefaultMimeType(),    // contentType
                engine.getVersion(),          // engineVersion
                info.getVersion()             // languageVersion
        );
        desc.setContentMimeTypes(info.getMimeTypes());
        return desc;
    }

    protected List<ScriptEngineDescriptor> buildSupportedLanguageInfos(
        @NotNull final Engine engine) {
        return engine.getLanguages().values().stream().map(value ->
            buildLanguageInfo(engine, value)
        ).collect(Collectors.toList());
    }

    public @NotNull List<ScriptEngineDescriptor> getSupportedLanguages() {
        return buildSupportedLanguageInfos(context.getEngine());
    }
}
