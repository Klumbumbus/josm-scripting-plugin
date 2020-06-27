package org.openstreetmap.josm.plugins.scripting.preferences.graalvm

import org.junit.BeforeClass
import org.junit.Test
import org.openstreetmap.josm.data.Preferences
import org.openstreetmap.josm.plugins.scripting.fixtures.JOSMFixture

import static org.junit.jupiter.api.Assertions.assertEquals
import static org.junit.jupiter.api.Assertions.assertFalse
import static org.junit.jupiter.api.Assertions.assertTrue
import static org.junit.jupiter.api.Assertions.assertNotNull

import static org.openstreetmap.josm.plugins.scripting.model.PreferenceKeys.*
import static org.openstreetmap.josm.plugins.scripting.preferences.graalvm.GraalVMPrivilegesModel.DefaultAccessPolicy.ALLOW_ALL
import static org.openstreetmap.josm.plugins.scripting.preferences.graalvm.GraalVMPrivilegesModel.DefaultAccessPolicy.DENY_ALL
import static org.openstreetmap.josm.plugins.scripting.preferences.graalvm.GraalVMPrivilegesModel.TernaryAccessPolicy.*

class GraalVMPrivilegesModelTest {

    @SuppressWarnings('unused')
    def shouldFail = new GroovyTestCase().&shouldFail

    @BeforeClass
    static void init() {
        //noinspection GroovyUnusedAssignment
        final JOSMFixture fixture = new JOSMFixture(true)
    }

    @Test
    void "should init default preferences"() {
        def model = new GraalVMPrivilegesModel()

        assertNotNull(model.getDefaultAccessPolicy())
        assertNotNull(model.getCreateProcessPolicy())
        assertNotNull(model.getCreateThreadPolicy())
        assertNotNull(model.getHostClassLoadingPolicy())
        assertNotNull(model.getIOPolicy())
        assertNotNull(model.getUseExperimentalOptionsPolicy())
    }

    @Test
    void "should properly init default access policy from preferences"() {

        Preferences prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "allow-all"
        prefs.put(GRAALVM_DEFAULT_ACCESS_POLICY, "allow-all")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW_ALL, model.getDefaultAccessPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_DEFAULT_ACCESS_POLICY, "deny-all")
        model.initFromPreferences(prefs)
        assertEquals(DENY_ALL, model.getDefaultAccessPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_DEFAULT_ACCESS_POLICY, "not-supported")
        model.initFromPreferences(prefs)
        assertEquals(DENY_ALL, model.getDefaultAccessPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DENY_ALL, model.getDefaultAccessPolicy())

    }

    @Test
    void "should properly init the create-process policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_CREATE_PROCESS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getCreateThreadPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_CREATE_PROCESS_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getCreateProcessPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_CREATE_PROCESS_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getCreateProcessPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getCreateProcessPolicy())
    }

    @Test
    void "should properly init the create-thread policy from preferences"() {
        Preferences prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_CREATE_THREAD_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getCreateThreadPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_CREATE_THREAD_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getCreateThreadPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_CREATE_THREAD_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getCreateThreadPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getCreateThreadPolicy())
    }

    @Test
    void "should properly init the host-class-loading policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_HOST_CLASS_LOADING_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getHostClassLoadingPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_HOST_CLASS_LOADING_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getHostClassLoadingPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_HOST_CLASS_LOADING_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getHostClassLoadingPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getHostClassLoadingPolicy())
    }

    @Test
    void "should properly init the io policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_IO_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getIOPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_IO_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getIOPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_IO_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getIOPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getIOPolicy())
    }

    @Test
    void "should properly init the native-access policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_NATIVE_ACCESS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getNativeAccessPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_NATIVE_ACCESS_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getNativeAccessPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_NATIVE_ACCESS_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getNativeAccessPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getNativeAccessPolicy())
    }

    @Test
    void "should properly init the use-experimental-options policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_USE_EXPERIMENTAL_OPTIONS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getUseExperimentalOptionsPolicy())

        // accept supported configuration value "deny-all"
        prefs.put(GRAALVM_USE_EXPERIMENTAL_OPTIONS_POLICY, "allow")
        model.initFromPreferences(prefs)
        assertEquals(ALLOW, model.getUseExperimentalOptionsPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_USE_EXPERIMENTAL_OPTIONS_POLICY, "deny")
        model.initFromPreferences(prefs)
        assertEquals(DENY, model.getUseExperimentalOptionsPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(DERIVE, model.getUseExperimentalOptionsPolicy())
    }

    @Test
    void "should properly init the environment-access-policy from preferences"() {
        def prefs = new Preferences()
        def model = new GraalVMPrivilegesModel()

        // accept supported configuration value "derive"
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertEquals(GraalVMPrivilegesModel.EnvironmentAccessPolicy.DERIVE,
            model.getEnvironmentAccessPolicy())

        // accept supported configuration value "none"
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "none")
        model.initFromPreferences(prefs)
        assertEquals(GraalVMPrivilegesModel.EnvironmentAccessPolicy.NONE,
            model.getEnvironmentAccessPolicy())

        // fall back to default value for an unsupported configuration value
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "unsupported-value")
        model.initFromPreferences(prefs)
        assertEquals(GraalVMPrivilegesModel.EnvironmentAccessPolicy.DERIVE,
            model.getEnvironmentAccessPolicy())

        // fall back to default value for a missing configuration value
        prefs = new Preferences()
        model.initFromPreferences(prefs)
        assertEquals(GraalVMPrivilegesModel.EnvironmentAccessPolicy.DERIVE,
            model.getEnvironmentAccessPolicy())

        // deny access if default access is deny-all
        prefs.put(GRAALVM_DEFAULT_ACCESS_POLICY, "deny-all")
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertFalse(model.allowEnvironmentAccess())

        // allow access if default access is allow-all
        prefs.put(GRAALVM_DEFAULT_ACCESS_POLICY, "allow-all")
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "derive")
        model.initFromPreferences(prefs)
        assertTrue(model.allowEnvironmentAccess())

        // deny access if environment access policy is 'none'
        prefs.put(GRAALVM_ENVIRONMENT_ACCESS_POLICY, "none")
        model.initFromPreferences(prefs)
        assertFalse(model.allowEnvironmentAccess())
    }
}
