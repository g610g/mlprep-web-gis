<?php
namespace App\Http\Controllers;

/**
 * GeoServer PHP REST API
 */
class GeoServer extends Controller
{
    protected function exec($request, array $args = [])
    {
        $header = isset($args['header']) ? $args['header'] : [];
        $successCode = isset($args['successCode']) ? $args['successCode'] : 200;
        $method = isset($args['method']) ? $args['method'] : 'GET';
        $data = isset($args['data']) ? $args['data'] : null;

        $service = config('geoserver.url');
        $url = $service . "rest/" . $request;
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $passwordStr = config('geoserver.username') . ':' . config('geoserver.password');
        curl_setopt($ch, CURLOPT_USERPWD, $passwordStr);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);

        if ($method == 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } elseif ($method == 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        } elseif ($method == 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }

        $result = curl_exec($ch);
        $info = curl_getinfo($ch);
        
        if ($info['http_code'] != $successCode) {
            $msgStr = "# Unsuccessful request to ";
            $msgStr .= $url . " [" . $info['http_code'] . "]\n";
            logger("[GeoServer]: $msgStr");
        } else {
            $msgStr = "# Successful request to " . $url . "\n";
            logger("[GeoServer]: $msgStr");
        }

        curl_close($ch);
        return [
            'result' => $result,
            'http_code' => $info['http_code']
        ];
    }

    protected function execFeature($request, $name = null)
    {
        $service = config('geoserver.url');
        $params = [
            'service' => 'wfs',
            'version' => '1.1.0',
            'request' => $request,
            'outputFormat' => 'application/json',
        ];

        if (!is_null($name)) {
            $params['typeNames'] = $name;
        }

        $url = $service . "wfs?" . http_build_query($params);
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

        $successCode = 200;
        $result = curl_exec($ch);
        $info = curl_getinfo($ch);
        
        if ($info['http_code'] != $successCode) {
            $msgStr = "# Unsuccessful request to ";
            $msgStr .= $url . " [" . $info['http_code'] . "]\n";
            logger("[GeoServer]: $msgStr");
        } else {
            $msgStr = "# Successful request to " . $url . "\n";
            logger("[GeoServer]: $msgStr");
        }

        curl_close($ch);
        return $result;
    }

    protected function getRest($url, $decode = false)
    {
        $header = ['Accept: application/json'];
        $response = $this->exec($url, compact('header'));
        $result = $response['result'];

        if (!$result) {
            return false;
        }

        switch ($decode) {
            case 'array':
                return json_decode($result, true);
                break;
            case 'object':
                return json_decode($result);
                break;
            default:
                return $result;
                break;
        }
    }

    public function getLayer($layer = null, $decode = 'object')
    {
        if (is_null($layer)) {
            $url = "layers.json";
        } else {
            $url = "layers/$layer.json";
        }

        return $this->getRest($url, $decode);
    }

    public function getWorkspace($workspace = null, $decode = 'object')
    {
        if (is_null($workspace)) {
            $url = "workspaces.json";
        } else {
            $url = "workspaces/$workspace.json";
        }

        return $this->getRest($url, $decode);
    }

    public function getFeatureInfo($request = 'GetCapabilities', $name = null)
    {
        return $this->execFeature($request, $name);
    }

    public function getStyle($workspace, $style = null, $decode = 'object')
    {
        if (is_null($style)) {
            $url = "workspaces/$workspace/styles.json";
        } else {
            $url = "workspaces/$workspace/styles/$style.sld";
            $decode = false;
        }

        return $this->getRest($url, $decode);
    }

    /**
     * Delete a layer from GeoServer
     * 
     * @param string $layer The name of the layer to delete
     * @param bool $recurse Whether to delete associated resources
     * @return array Response with success status and message
     */
    public function deleteLayer($layer, $recurse = true)
    {
        try {
            // First, get layer info to determine workspace and datastore
            $layerInfo = $this->getLayer($layer, 'array');
            
            if (!$layerInfo || !isset($layerInfo['layer'])) {
                return [
                    'success' => false,
                    'message' => 'Layer not found',
                    'http_code' => 404
                ];
            }

            $workspace = null;
            $datastore = null;

            // Extract workspace and datastore from layer resource href
            if (isset($layerInfo['layer']['resource']['@href'])) {
                $href = $layerInfo['layer']['resource']['@href'];
                // Parse the href to get workspace and datastore
                // Example: http://localhost:8080/geoserver/rest/workspaces/mlprep/datastores/shapefile/featuretypes/layer_name.xml
                if (preg_match('/workspaces\/([^\/]+)\/datastores\/([^\/]+)/', $href, $matches)) {
                    $workspace = $matches[1];
                    $datastore = $matches[2];
                }
            }

            $queryParams = $recurse ? '?recurse=true' : '';

            // If we have workspace and datastore info, delete the featuretype first
            if ($workspace && $datastore) {
                $featureTypeUrl = "workspaces/$workspace/datastores/$datastore/featuretypes/$layer" . $queryParams;
                $response = $this->exec($featureTypeUrl, [
                    'method' => 'DELETE',
                    'successCode' => 200
                ]);

                if ($response['http_code'] !== 200) {
                    // If featuretype deletion fails, try direct layer deletion
                    $layerUrl = "layers/$layer" . $queryParams;
                    $response = $this->exec($layerUrl, [
                        'method' => 'DELETE',
                        'successCode' => 200
                    ]);
                }
            } else {
                // Fallback: try to delete layer directly
                $layerUrl = "layers/$layer" . $queryParams;
                $response = $this->exec($layerUrl, [
                    'method' => 'DELETE',
                    'successCode' => 200
                ]);
            }

            if ($response['http_code'] === 200) {
                return [
                    'success' => true,
                    'message' => 'Layer deleted successfully',
                    'http_code' => 200
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to delete layer from GeoServer',
                    'http_code' => $response['http_code']
                ];
            }

        } catch (\Exception $e) {
            logger("[GeoServer Delete Error]: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while deleting the layer: ' . $e->getMessage(),
                'http_code' => 500
            ];
        }
    }

    /**
     * Delete multiple layers at once
     * 
     * @param array $layers Array of layer names to delete
     * @param bool $recurse Whether to delete associated resources
     * @return array Response with results for each layer
     */
    public function deleteLayers(array $layers, $recurse = true)
    {
        $results = [];
        
        foreach ($layers as $layer) {
            $results[$layer] = $this->deleteLayer($layer, $recurse);
        }

        return $results;
    }

    /**
     * Delete a workspace and all its contents
     * 
     * @param string $workspace The name of the workspace to delete
     * @param bool $recurse Whether to delete all contents recursively
     * @return array Response with success status and message
     */
    public function deleteWorkspace($workspace, $recurse = true)
    {
        try {
            $queryParams = $recurse ? '?recurse=true' : '';
            $url = "workspaces/$workspace" . $queryParams;
            
            $response = $this->exec($url, [
                'method' => 'DELETE',
                'successCode' => 200
            ]);

            if ($response['http_code'] === 200) {
                return [
                    'success' => true,
                    'message' => 'Workspace deleted successfully',
                    'http_code' => 200
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to delete workspace from GeoServer',
                    'http_code' => $response['http_code']
                ];
            }

        } catch (\Exception $e) {
            logger("[GeoServer Delete Workspace Error]: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'An error occurred while deleting the workspace: ' . $e->getMessage(),
                'http_code' => 500
            ];
        }
    }
}